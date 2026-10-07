import { Repository } from "../Shared/repository.js";
import { Episode } from "./episode.entity.js";
import { db } from "../Shared/database/connections.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";

/**
 * Type representing an episode row retrieved from the 'episodes' table in MySQL.
 */
type EpisodeRow = RowDataPacket & {
    id: number;
    id_season: number;
    episode_number: number;
    title: string;
    description: string;
    path: string;
    views: number;
    state: string;
    id_author: number;
};

/**
 * Transforms an EpisodeRow database record into an instance of Episode.
 */
const toEpisode = (row: EpisodeRow): Episode => new Episode(
    row.id_season,
    row.episode_number,
    row.title,
    row.description,
    row.path,
    row.id_author,
    Number(row.views),
    row.state,
    row.id
);

/**
 * EpisodeRepository implements data access logic for Episode entities.
 */
export class EpisodeRepository implements Repository<Episode> {

    /**
     * Retrieves all episodes from the platform ordered by season and episode number.
     */
    async findAll(): Promise<Episode[]> {
        const [rows] = await db.query<EpisodeRow[]>(
            "SELECT id, id_season, episode_number, title, description, path, views, state, id_author FROM episodes ORDER BY id_season, episode_number"
        );
        return rows.map(toEpisode);
    }

    /**
     * Finds a single episode by its primary key ID.
     */
    async findOne(id: number): Promise<Episode | undefined> {
        const [rows] = await db.query<EpisodeRow[]>(
            "SELECT id, id_season, episode_number, title, description, path, views, state, id_author FROM episodes WHERE id = ?",
            [id]
        );
        return rows[0] ? toEpisode(rows[0]) : undefined;
    }

    /**
     * Specialized query: retrieves all episodes belonging to a specific season.
     * Ordered chronologically by episode_number.
     */
    async findBySeason(id_season: number): Promise<Episode[]> {
        const [rows] = await db.query<EpisodeRow[]>(
            "SELECT id, id_season, episode_number, title, description, path, views, state, id_author FROM episodes WHERE id_season = ? ORDER BY episode_number",
            [id_season]
        );
        return rows.map(toEpisode);
    }

    /**
     * Inserts a new episode record into MySQL.
     */
    async create(item: Episode): Promise<Episode> {
        const [result] = await db.execute<ResultSetHeader>(
            "INSERT INTO episodes (id_season, episode_number, title, description, path, views, state, id_author) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [item.id_season, item.episode_number, item.title, item.description, item.path, item.views, item.state, item.id_author]
        );
        item.id = result.insertId;
        return item;
    }

    /**
     * Partially updates an episode row.
     */
    async update(id: number, input: Partial<Episode>): Promise<Episode | undefined> {
        const allowedFields = ["id_season", "episode_number", "title", "description", "path", "views", "state", "id_author"] as const;
        const fields = allowedFields.filter((field) => input[field] !== undefined);
        if (fields.length === 0) return this.findOne(id);

        const assignments = fields.map((field) => `${field} = ?`).join(", ");
        const values = fields.map((field) => input[field]) as Array<string | number | boolean>;

        await db.execute(
            `UPDATE episodes SET ${assignments} WHERE id = ?`,
            [...values, id]
        );
        return this.findOne(id);
    }

    /**
     * Deletes an episode by ID.
     */
    async delete(id: number): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>(
            "DELETE FROM episodes WHERE id = ?",
            [id]
        );
        return result.affectedRows > 0;
    }
}
