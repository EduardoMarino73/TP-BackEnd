import { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "../Shared/database/connections.js";
import { Appeal } from "./appeal.entity.js";

type AppealRow = RowDataPacket & {
    id: number;
    description: string;
    report_id: number;
    administrator_id: number | null;
    reviewed: number;
    decision: Appeal["decision"];
};

function toAppeal(row: AppealRow): Appeal {
    return new Appeal(
        row.id,
        row.description,
        row.report_id,
        row.administrator_id,
        Boolean(row.reviewed),
        row.decision,
    );
}

const APPEAL_COLUMNS = `
    id,
    description,
    moderation_case_id AS report_id,
    administrator_id,
    reviewed,
    decision`;

/** Database access for content-owner appeals and administrator review queues. */
export class AppealRepository {
    /** Returns every appeal. */
    async findAll(): Promise<Appeal[]> {
        const [rows] = await db.query<AppealRow[]>(
            `SELECT ${APPEAL_COLUMNS} FROM content_appeals ORDER BY id`,
        );
        return rows.map(toAppeal);
    }

    /** Returns appeals awaiting an administrator's decision. */
    async findPending(): Promise<Appeal[]> {
        const [rows] = await db.query<AppealRow[]>(
            `SELECT ${APPEAL_COLUMNS}
             FROM content_appeals
             WHERE reviewed = FALSE
             ORDER BY id`,
        );
        return rows.map(toAppeal);
    }

    /** Returns appeals filed against content uploaded by a viewer. */
    async findByViewer(viewerId: number): Promise<Appeal[]> {
        const [rows] = await db.execute<AppealRow[]>(
            `SELECT DISTINCT
                    a.id,
                    a.description,
                    a.moderation_case_id AS report_id,
                    a.administrator_id,
                    a.reviewed,
                    a.decision
             FROM content_appeals AS a
             JOIN moderation_cases AS c ON c.id = a.moderation_case_id
             LEFT JOIN movies AS m
                ON c.target_type = 'movie' AND c.target_id = m.id
             LEFT JOIN series AS s
                ON c.target_type = 'series' AND c.target_id = s.id
             WHERE m.id_author = ? OR s.id_author = ?
             ORDER BY a.id`,
            [viewerId, viewerId],
        );
        return rows.map(toAppeal);
    }

    /** Finds an appeal by its ID. */
    async findOne(id: number): Promise<Appeal | undefined> {
        const [rows] = await db.execute<AppealRow[]>(
            `SELECT ${APPEAL_COLUMNS} FROM content_appeals WHERE id = ?`,
            [id],
        );
        return rows[0] ? toAppeal(rows[0]) : undefined;
    }

    /** Finds the appeal associated with a moderation case. */
    async findByReport(reportId: number): Promise<Appeal | undefined> {
        const [rows] = await db.execute<AppealRow[]>(
            `SELECT ${APPEAL_COLUMNS}
             FROM content_appeals
             WHERE moderation_case_id = ?
             LIMIT 1`,
            [reportId],
        );
        return rows[0] ? toAppeal(rows[0]) : undefined;
    }

    /** Creates an appeal for a moderation case. */
    async create(input: {
        description: string;
        reportId: number;
    }): Promise<Appeal> {
        const [result] = await db.execute<ResultSetHeader>(
            `INSERT INTO content_appeals (description, moderation_case_id)
             VALUES (?, ?)`,
            [input.description, input.reportId],
        );
        const appeal = await this.findOne(result.insertId);
        if (!appeal) throw new Error("Created appeal could not be loaded");
        return appeal;
    }

    /**
     * Resolves an appeal and applies its moderation result atomically.
     * Rejecting the appeal upholds the complaint and suspends the content.
     */
    async resolve(
        id: number,
        administratorId: number,
        decision: NonNullable<Appeal["decision"]>,
        minimumReportCount: number,
    ): Promise<{ appeal: Appeal; reportCount: number; suspended: boolean } | undefined> {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();
            const [rows] = await connection.execute<(AppealRow & {
                target_type: "movie" | "series";
                target_id: number;
                case_status: "pending" | "appealed" | "upheld" | "dismissed";
            })[]>(
                `SELECT a.id, a.description,
                        a.moderation_case_id AS report_id,
                        a.administrator_id, a.reviewed, a.decision,
                        c.target_type, c.target_id, c.status AS case_status
                 FROM content_appeals AS a
                 JOIN moderation_cases AS c ON c.id = a.moderation_case_id
                 WHERE a.id = ?
                 FOR UPDATE`,
                [id],
            );

            const row = rows[0];
            if (!row || row.reviewed) {
                await connection.rollback();
                return undefined;
            }

            const caseStatus = decision === "approved" ? "dismissed" : "upheld";
            await connection.execute(
                "UPDATE moderation_cases SET status = ? WHERE id = ?",
                [caseStatus, row.report_id],
            );

            const [countRows] = await connection.execute<(RowDataPacket & { total: number })[]>(
                `SELECT COUNT(*) AS total
                 FROM content_reports
                 WHERE target_type = ? AND target_id = ?`,
                [row.target_type, row.target_id],
            );
            const reportCount = Number(countRows[0].total);
            const suspended = decision === "rejected"
                && reportCount >= minimumReportCount;

            if (suspended) {
                const table = row.target_type === "movie" ? "movies" : "series";
                const [updateResult] = await connection.execute<ResultSetHeader>(
                    `UPDATE ${table} SET state = 'suspended' WHERE id = ?`,
                    [row.target_id],
                );
                if (updateResult.affectedRows !== 1) {
                    throw new Error("Reported content could not be suspended");
                }
            }

            const [updateResult] = await connection.execute<ResultSetHeader>(
                `UPDATE content_appeals
                 SET administrator_id = ?,
                     reviewed = TRUE,
                     decision = ?,
                     reviewed_at = CURRENT_TIMESTAMP
                 WHERE id = ? AND reviewed = FALSE`,
                [administratorId, decision, id],
            );
            if (updateResult.affectedRows !== 1) {
                throw new Error("Appeal was already reviewed");
            }

            await connection.commit();
            return {
                appeal: new Appeal(
                    row.id,
                    row.description,
                    row.report_id,
                    administratorId,
                    true,
                    decision,
                ),
                reportCount,
                suspended,
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}
