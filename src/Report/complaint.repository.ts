import { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "../Shared/database/connections.js";
import { Complaint, ContentReport, ReportTargetType } from "./complaint.entity.js";

type ComplaintRow = RowDataPacket & {
    id: number;
    target_type: ReportTargetType;
    target_id: number;
    report_count: number;
    status: Complaint["status"];
};

type ContentReportRow = RowDataPacket & {
    id: number;
    target_type: ReportTargetType;
    target_id: number;
    reporter_id: number;
    reason: string;
};

function toComplaint(row: ComplaintRow): Complaint {
    return new Complaint(
        row.id,
        row.target_type,
        row.target_id,
        Number(row.report_count),
        row.status,
    );
}

function toContentReport(row: ContentReportRow): ContentReport {
    return new ContentReport(
        row.id,
        row.target_type,
        row.target_id,
        row.reporter_id,
        row.reason,
    );
}

/** Stores individual reports and threshold-based moderation cases. */
export class ComplaintRepository {
    /** Returns all moderation cases. */
    async findAll(): Promise<Complaint[]> {
        const [rows] = await db.query<ComplaintRow[]>(
            `SELECT id, target_type, target_id, report_count, status
             FROM moderation_cases
             ORDER BY id`,
        );
        return rows.map(toComplaint);
    }

    /** Finds a moderation case by its ID. */
    async findOne(id: number): Promise<Complaint | undefined> {
        const [rows] = await db.execute<ComplaintRow[]>(
            `SELECT id, target_type, target_id, report_count, status
             FROM moderation_cases
             WHERE id = ?`,
            [id],
        );
        return rows[0] ? toComplaint(rows[0]) : undefined;
    }

    /**
     * Saves one viewer report and creates one moderation case when the report
     * threshold is first reached. Locking the content row serializes the count.
     */
    async submitReport(input: {
        targetType: ReportTargetType;
        targetId: number;
        reporterId: number;
        reason: string;
    }, threshold: number): Promise<{
        report?: ContentReport;
        reportCount?: number;
        complaintCreated?: Complaint;
        error?: "not_found" | "own_content" | "inactive" | "duplicate";
    }> {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const table = input.targetType === "movie" ? "movies" : "series";
            const [contentRows] = await connection.execute<(RowDataPacket & {
                id_author: number;
                state: string;
            })[]>(
                `SELECT id_author, state FROM ${table} WHERE id = ? FOR UPDATE`,
                [input.targetId],
            );
            const content = contentRows[0];

            if (!content) {
                await connection.rollback();
                return { error: "not_found" };
            }
            if (Number(content.id_author) === input.reporterId) {
                await connection.rollback();
                return { error: "own_content" };
            }
            if (content.state !== "active") {
                await connection.rollback();
                return { error: "inactive" };
            }

            const [existingRows] = await connection.execute<(RowDataPacket & { id: number })[]>(
                `SELECT id
                 FROM content_reports
                 WHERE reporter_id = ? AND target_type = ? AND target_id = ?
                 LIMIT 1`,
                [input.reporterId, input.targetType, input.targetId],
            );
            if (existingRows.length > 0) {
                await connection.rollback();
                return { error: "duplicate" };
            }

            const [insertResult] = await connection.execute<ResultSetHeader>(
                `INSERT INTO content_reports
                    (target_type, target_id, reporter_id, reason)
                 VALUES (?, ?, ?, ?)`,
                [input.targetType, input.targetId, input.reporterId, input.reason],
            );
            const [countRows] = await connection.execute<(RowDataPacket & { total: number })[]>(
                `SELECT COUNT(*) AS total
                 FROM content_reports
                 WHERE target_type = ? AND target_id = ?`,
                [input.targetType, input.targetId],
            );
            const reportCount = Number(countRows[0].total);
            let complaintCreated: Complaint | undefined;

            if (reportCount >= threshold) {
                const [caseRows] = await connection.execute<(RowDataPacket & { id: number })[]>(
                    `SELECT id
                     FROM moderation_cases
                     WHERE target_type = ? AND target_id = ?
                     LIMIT 1`,
                    [input.targetType, input.targetId],
                );

                if (caseRows.length === 0) {
                    const [caseResult] = await connection.execute<ResultSetHeader>(
                        `INSERT INTO moderation_cases
                            (target_type, target_id, report_count)
                         VALUES (?, ?, ?)`,
                        [input.targetType, input.targetId, reportCount],
                    );
                    complaintCreated = new Complaint(
                        caseResult.insertId,
                        input.targetType,
                        input.targetId,
                        reportCount,
                        "pending",
                    );
                }
            }

            await connection.commit();
            return {
                report: new ContentReport(
                    insertResult.insertId,
                    input.targetType,
                    input.targetId,
                    input.reporterId,
                    input.reason,
                ),
                reportCount,
                complaintCreated,
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /** Returns a case and the current total reports for its audiovisual. */
    async findWithReportCount(id: number) {
        const complaint = await this.findOne(id);
        if (!complaint) return undefined;

        const [[countRows], [reportRows]] = await Promise.all([
            db.execute<(RowDataPacket & { total: number })[]>(
            `SELECT COUNT(*) AS total
             FROM content_reports
             WHERE target_type = ? AND target_id = ?`,
            [complaint.targetType, complaint.targetId],
            ),
            db.execute<ContentReportRow[]>(
                `SELECT id, target_type, target_id, reporter_id, reason
                 FROM content_reports
                 WHERE target_type = ? AND target_id = ?
                 ORDER BY id`,
                [complaint.targetType, complaint.targetId],
            ),
        ]);
        return {
            complaint,
            reportCount: Number(countRows[0].total),
            reports: reportRows.map(toContentReport),
        };
    }

    /** Counts active reports against audiovisual content owned by a viewer. */
    async countReceivedByViewer(viewerId: number): Promise<number> {
        const [rows] = await db.execute<(RowDataPacket & { total: number })[]>(
            `SELECT COUNT(*) AS total
             FROM content_reports AS r
             LEFT JOIN movies AS m
                ON r.target_type = 'movie' AND r.target_id = m.id
             LEFT JOIN series AS s
                ON r.target_type = 'series' AND r.target_id = s.id
             WHERE m.id_author = ? OR s.id_author = ?`,
            [viewerId, viewerId],
        );
        return Number(rows[0].total);
    }

    /** Changes a moderation case's status. */
    async setStatus(id: number, status: Complaint["status"]): Promise<void> {
        await db.execute(
            "UPDATE moderation_cases SET status = ? WHERE id = ?",
            [status, id],
        );
    }

    /** Marks a case as awaiting administrator review. */
    async markAppealed(id: number): Promise<void> {
        await db.execute(
            "UPDATE moderation_cases SET status = 'appealed' WHERE id = ?",
            [id],
        );
    }
}
