import { Serie } from "./series.entity.js";
import { db } from "../Shared/database/connections.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Repository } from "../Shared/repository.js";

/**
 * Type representing a row retrieved directly from the 'series' SQL table.
 * Extends RowDataPacket to integrate with mysql2 type definitions.
 */
type SerieRow = RowDataPacket & {
    id: number;
    title: string;
    description: string;
    category: string;
    id_author: number;
    state: string | number;
    thumbnail_path: string | null;
    uploader_user_name?: string | null;
};

/**
 * Every read joins the uploader, so the detail can show who uploaded the series.
 * thumbnail_path is the series' own cover or, when it has none, the thumbnail of its
 * first active episode (lowest season number, then lowest episode number).
 */
const SERIES_SELECT = `SELECT s.id, s.title, s.description, s.category, s.id_author, s.state,
        COALESCE(s.thumbnail_path, (
            SELECT e.thumbnail_path
            FROM seasons AS se
            JOIN episodes AS e ON e.id_season = se.id
            WHERE se.id_serie = s.id AND se.state = 'active' AND e.state = 'active'
              AND e.thumbnail_path IS NOT NULL
            ORDER BY se.season_number, e.episode_number
            LIMIT 1
        )) AS thumbnail_path,
        u.user_name AS uploader_user_name
    FROM series AS s
    LEFT JOIN users AS u ON u.id_user = s.id_author`;

/**
 * Helper function that transforms a raw MySQL database row into an instance of the Serie domain entity.
 */
const toSerie = (row: SerieRow): Serie => Object.assign(new Serie(
    row.id_author,
    row.title,
    row.category,
    row.description,
    String(row.state),
    row.id
), {
    uploader_user_name: row.uploader_user_name ?? undefined,
    thumbnail_path: row.thumbnail_path ?? null,
});

/**
 * SeriesRepository implements the generic Repository contract for Serie entities (Data Access Object / DAO).
 * It directly executes parameterized SQL queries against MySQL using the connection pool.
 */
export class SeriesRepository implements Repository<Serie> {

    /**
     * Retrieves all series from the database ordered by their ID.
     */
    async findAll(): Promise<Serie[]> {
        // Execute the query; destructure rows from the first element of the returned tuple
        const [rows] = await db.query<SerieRow[]>(
            `${SERIES_SELECT} WHERE s.state = 'active' ORDER BY s.id`
        );
        // Map each database row into a Serie domain instance
        return rows.map(toSerie);
    }

    /**
     * Retrieves a single series by its unique ID.
     * Returns the Serie entity if found, or undefined if no record matches.
     */
    async findOne(id: number): Promise<Serie | undefined> {
        // Use parameterized query '?' to prevent SQL injection vulnerabilities
        const [rows] = await db.query<SerieRow[]>(
            `${SERIES_SELECT} WHERE s.id = ? AND s.state = 'active'`,
            [id]
        );
        // Return domain object if row exists, otherwise undefined
        return rows[0] ? toSerie(rows[0]) : undefined;
    }

    /**
     * Inserts a new series record into the 'series' table.
     * Sets the auto-generated ID onto the entity and returns it.
     */
    async create(item: Serie): Promise<Serie> {
        const [result] = await db.execute<ResultSetHeader>(
            "INSERT INTO series (title, description, category, thumbnail_path, id_author, state) VALUES (?, ?, ?, ?, ?, ?)",
            [item.title, item.description, item.category, item.thumbnail_path, item.id_author, item.state]
        );
        // Assign the generated auto-increment primary key ID to the entity
        item.id = result.insertId;
        return item;
    }

    /**
     * Updates an existing series dynamically based on provided fields (partial update).
     */
    async update(id: number, input: Partial<Serie>): Promise<Serie | undefined> {
        // Whitelist allowed fields to prevent arbitrary or malicious column updates
        // The author and the state are never changed through an edit
        const allowedFields = ["title", "description", "category"] as const;
        const fields = allowedFields.filter((field) => input[field] !== undefined);

        // If no valid fields were supplied, simply return the current state of the series
        if (fields.length === 0) return this.findOne(id);

        // Build dynamic SQL query: "title = ?, description = ?"
        const assignments = fields.map((field) => `${field} = ?`).join(", ");
        const values = fields.map((field) => input[field]) as Array<string | number | boolean>;

        // Execute the parameterized update query
        await db.execute(
            `UPDATE series SET ${assignments} WHERE id = ?`,
            [...values, id]
        );
        // Fetch and return the updated series from the database
        return this.findOne(id);
    }

    /**
     * Logical delete: the series (and with it its seasons and episodes) is hidden, but the rows are kept.
     * Returns true if at least one row was affected, false otherwise.
     */
    async delete(id: number): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>(
            "UPDATE series SET state = 'deleted' WHERE id = ? AND state = 'active'",
            [id]
        );
        return result.affectedRows > 0;
    }
}
