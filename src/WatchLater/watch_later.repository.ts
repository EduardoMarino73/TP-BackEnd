import { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "../Shared/database/connections.js";
import { WatchLater, WatchLaterItem, WatchLaterType } from "./watch_later.entity.js";

/** A row of watch_later joined with its movie or series. */
type WatchLaterRow = RowDataPacket & {
    id: number;
    viewer_id: number;
    audiovisual_id: number;
    audiovisual_type: WatchLaterType;
    created_at: Date;
    title: string;
    category: string;
    description: string;
};

const toItem = (row: WatchLaterRow): WatchLaterItem => Object.assign(
    new WatchLater(row.viewer_id, row.audiovisual_id, row.audiovisual_type, row.id, row.created_at),
    { title: row.title, category: row.category ?? "", description: row.description ?? "" },
);

/** Database access for the "Watch later" lists. */
export class WatchLaterRepository {
    /**
     * The viewer's list, newest first. Content that is no longer active
     * (suspended or deleted) is left out.
     */
    async findByViewer(viewerId: number): Promise<WatchLaterItem[]> {
        const [rows] = await db.execute<WatchLaterRow[]>(
            `SELECT w.id, w.viewer_id, w.audiovisual_id, w.audiovisual_type, w.created_at,
                    COALESCE(m.title, s.title) AS title,
                    COALESCE(m.category, s.category) AS category,
                    COALESCE(m.description, s.description) AS description
             FROM watch_later AS w
             LEFT JOIN movies AS m
                ON w.audiovisual_type = 'movie' AND m.id = w.audiovisual_id AND m.state = 'active'
             LEFT JOIN series AS s
                ON w.audiovisual_type = 'series' AND s.id = w.audiovisual_id AND s.state = 'active'
             WHERE w.viewer_id = ? AND COALESCE(m.id, s.id) IS NOT NULL
             ORDER BY w.created_at DESC, w.id DESC`,
            [viewerId],
        );
        return rows.map(toItem);
    }

    async findOne(id: number): Promise<WatchLater | undefined> {
        const [rows] = await db.execute<WatchLaterRow[]>(
            "SELECT id, viewer_id, audiovisual_id, audiovisual_type, created_at FROM watch_later WHERE id = ?",
            [id],
        );
        const row = rows[0];
        return row
            ? new WatchLater(row.viewer_id, row.audiovisual_id, row.audiovisual_type, row.id, row.created_at)
            : undefined;
    }

    /** Fails with ER_DUP_ENTRY when the viewer already saved that content. */
    async create(item: WatchLater): Promise<WatchLater> {
        const [result] = await db.execute<ResultSetHeader>(
            "INSERT INTO watch_later (viewer_id, audiovisual_id, audiovisual_type) VALUES (?, ?, ?)",
            [item.viewerId, item.audiovisualId, item.audiovisualType],
        );
        item.id = result.insertId;
        item.addedAt = new Date();
        return item;
    }

    async delete(id: number): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>("DELETE FROM watch_later WHERE id = ?", [id]);
        return result.affectedRows > 0;
    }
}
