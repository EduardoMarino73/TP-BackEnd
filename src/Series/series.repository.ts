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
};

/**
 * Helper function that transforms a raw MySQL database row into an instance of the Serie domain entity.
 */
const toSerie = (row: SerieRow): Serie => new Serie(
    row.id_author,
    row.title,
    row.category,
    row.description,
    String(row.state),
    row.id
);

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
            "SELECT id, title, description, category, id_author, state FROM series WHERE state = 'active' ORDER BY id"
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
            "SELECT id, title, description, category, id_author, state FROM series WHERE id = ? AND state = 'active'",
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
            "INSERT INTO series (title, description, category, id_author, state) VALUES (?, ?, ?, ?, ?)",
            [item.title, item.description, item.category, item.id_author, item.state]
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
        const allowedFields = ["title", "description", "category", "id_author", "state"] as const;
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
     * Deletes a series by ID. Returns true if at least one row was affected, false otherwise.
     */
    async delete(id: number): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>(
            "DELETE FROM series WHERE id = ?",
            [id]
        );
        return result.affectedRows > 0;
    }
}
