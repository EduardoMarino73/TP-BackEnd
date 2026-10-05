import { Repository } from "../Shared/repository.js";
import { Season } from "./season.entity.js";
import { db } from "../Shared/database/connections.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";

/**
 * Type representing a row retrieved from the 'seasons' table in MySQL.
 */
type SeasonRow = RowDataPacket & {
    id: number;
    id_serie: number;
    season_number: number;
    description: string;
};

/**
 * Transforms a raw database row into an instance of the Season entity.
 */
const toSeason = (row: SeasonRow): Season => new Season(
    row.id_serie,
    row.season_number,
    row.description,
    row.id
);

/**
 * SeasonRepository provides data access methods for Season entities in the MySQL database.
 */
export class SeasonRepository implements Repository<Season> {

    /**
     * Retrieves all seasons ordered by season number.
     */
    async findAll(): Promise<Season[]> {
        const [rows] = await db.query<SeasonRow[]>(
            "SELECT id, id_serie, season_number, description FROM seasons ORDER BY season_number"
        );
        return rows.map(toSeason);
    }

    /**
     * Finds a single season by its primary key ID.
     */
    async findOne(id: number): Promise<Season | undefined> {
        const [rows] = await db.query<SeasonRow[]>(
            "SELECT id, id_serie, season_number, description FROM seasons WHERE id = ?",
            [id]
        );
        return rows[0] ? toSeason(rows[0]) : undefined;
    }

    /**
     * Specialized query: retrieves all seasons belonging to a specific series.
     * Ordered ascending by season_number so the frontend displays them chronologically.
     */
    async findBySerie(id_serie: number): Promise<Season[]> {
        const [rows] = await db.query<SeasonRow[]>(
            "SELECT id, id_serie, season_number, description FROM seasons WHERE id_serie = ? ORDER BY season_number",
            [id_serie]
        );
        return rows.map(toSeason);
    }

    /**
     * Inserts a new season row linked to a parent series.
     */
    async create(item: Season): Promise<Season> {
        const [result] = await db.execute<ResultSetHeader>(
            "INSERT INTO seasons (id_serie, season_number, description) VALUES (?, ?, ?)",
            [item.id_serie, item.season_number, item.description]
        );
        item.id = result.insertId;
        return item;
    }

    /**
     * Partially or fully updates a season record in the database.
     */
    async update(id: number, input: Partial<Season>): Promise<Season | undefined> {
        const allowedFields = ["id_serie", "season_number", "description"] as const;
        const fields = allowedFields.filter((field) => input[field] !== undefined);
        if (fields.length === 0) return this.findOne(id);

        const assignments = fields.map((field) => `${field} = ?`).join(", ");
        const values = fields.map((field) => input[field]) as Array<string | number>;

        await db.execute(
            `UPDATE seasons SET ${assignments} WHERE id = ?`,
            [...values, id]
        );
        return this.findOne(id);
    }

    /**
     * Deletes a season by ID.
     * Note: Thanks to ON DELETE CASCADE, all child episodes in MySQL will be automatically deleted as well.
     */
    async delete(id: number): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>(
            "DELETE FROM seasons WHERE id = ?",
            [id]
        );
        return result.affectedRows > 0;
    }
}
