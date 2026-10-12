import { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "../Shared/database/connections.js";
import {
    CaseFilters, Complaint, ContentReport, ModerationCaseSummary, ReasonCount, ReportTargetType,
} from "./complaint.entity.js";

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
    report_type_id: number;
    report_type: string;
    details: string | null;
};

/** Columns of a report, with the name of its type. Needs "FROM content_reports AS r JOIN report_types AS t". */
const REPORT_COLUMNS = `r.id, r.target_type, r.target_id, r.reporter_id,
    r.report_type_id, t.name AS report_type, r.details`;

function toComplaint(row: ComplaintRow): Complaint {
    return new Complaint(
        row.id,
        row.target_type,
        row.target_id,
        Number(row.report_count),
        row.status,
    );
}

/** A row of findCases: the case joined with its content, owner and appeal. */
type CaseRow = ComplaintRow & {
    created_at: Date;
    title: string | null;
    content_state: string | null;
    owner_id: number | null;
    owner_username: string | null;
    appeal_id: number | null;
    appeal_description: string | null;
    appeal_reviewed: number | null;
    appeal_decision: "approved" | "rejected" | null;
};

function toCaseSummary(row: CaseRow, reasons: ReasonCount[]): ModerationCaseSummary {
    return {
        id: row.id,
        targetType: row.target_type,
        targetId: row.target_id,
        reportCount: Number(row.report_count),
        status: row.status,
        createdAt: row.created_at,
        content: {
            title: row.title,
            state: row.content_state,
            ownerId: row.owner_id,
            ownerUsername: row.owner_username,
        },
        reasons,
        appeal: row.appeal_id === null ? null : {
            id: row.appeal_id,
            description: row.appeal_description ?? "",
            reviewed: Boolean(row.appeal_reviewed),
            decision: row.appeal_decision,
        },
    };
}

function toContentReport(row: ContentReportRow): ContentReport {
    return new ContentReport(
        row.id,
        row.target_type,
        row.target_id,
        row.reporter_id,
        row.report_type_id,
        row.report_type,
        row.details,
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
        reportTypeId: number;
        reportType: string;
        details: string | null;
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
                    (target_type, target_id, reporter_id, report_type_id, details)
                 VALUES (?, ?, ?, ?, ?)`,
                [input.targetType, input.targetId, input.reporterId, input.reportTypeId, input.details],
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
                    input.reportTypeId,
                    input.reportType,
                    input.details,
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
                `SELECT ${REPORT_COLUMNS}
                 FROM content_reports AS r
                 JOIN report_types AS t ON t.id = r.report_type_id
                 WHERE r.target_type = ? AND r.target_id = ?
                 ORDER BY r.id`,
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

    /**
     * Lists moderation cases with their content, owner, appeal and reasons grouped by type.
     * Every filter is optional; the newest cases come first.
     */
    async findCases(filters: CaseFilters = {}): Promise<ModerationCaseSummary[]> {
        const conditions: string[] = [];
        const params: Array<string | number> = [];
        if (filters.id !== undefined) {
            conditions.push("c.id = ?");
            params.push(filters.id);
        }
        if (filters.status !== undefined) {
            conditions.push("c.status = ?");
            params.push(filters.status);
        }
        if (filters.ownerId !== undefined) {
            conditions.push("COALESCE(m.id_author, s.id_author) = ?");
            params.push(filters.ownerId);
        }
        if (filters.reportTypeId !== undefined) {
            conditions.push(`EXISTS (SELECT 1 FROM content_reports AS fr
                 WHERE fr.target_type = c.target_type AND fr.target_id = c.target_id
                   AND fr.report_type_id = ?)`);
            params.push(filters.reportTypeId);
        }

        const [rows] = await db.query<CaseRow[]>(
            `SELECT c.id, c.target_type, c.target_id, c.report_count, c.status, c.created_at,
                    COALESCE(m.title, s.title) AS title,
                    COALESCE(m.state, s.state) AS content_state,
                    u.id_user AS owner_id, u.user_name AS owner_username,
                    a.id AS appeal_id, a.description AS appeal_description,
                    a.reviewed AS appeal_reviewed, a.decision AS appeal_decision
             FROM moderation_cases AS c
             LEFT JOIN movies AS m ON c.target_type = 'movie' AND m.id = c.target_id
             LEFT JOIN series AS s ON c.target_type = 'series' AND s.id = c.target_id
             LEFT JOIN users AS u ON u.id_user = COALESCE(m.id_author, s.id_author)
             LEFT JOIN content_appeals AS a ON a.moderation_case_id = c.id
             ${conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""}
             ORDER BY c.id DESC`,
            params,
        );
        if (rows.length === 0) return [];

        // reasons of every listed case, grouped by report type
        const [reasonRows] = await db.query<(RowDataPacket & {
            case_id: number; report_type_id: number; report_type: string; total: number;
        })[]>(
            `SELECT c.id AS case_id, t.id AS report_type_id, t.name AS report_type, COUNT(*) AS total
             FROM moderation_cases AS c
             JOIN content_reports AS r ON r.target_type = c.target_type AND r.target_id = c.target_id
             JOIN report_types AS t ON t.id = r.report_type_id
             WHERE c.id IN (?)
             GROUP BY c.id, t.id, t.name
             ORDER BY total DESC, t.name`,
            [rows.map((row) => row.id)],
        );
        const reasons = new Map<number, ReasonCount[]>();
        reasonRows.forEach((row) => {
            const list = reasons.get(row.case_id) ?? [];
            list.push({ reportTypeId: row.report_type_id, reportType: row.report_type, count: Number(row.total) });
            reasons.set(row.case_id, list);
        });

        return rows.map((row) => toCaseSummary(row, reasons.get(row.id) ?? []));
    }

    /** Marks a case as awaiting administrator review. */
    async markAppealed(id: number): Promise<void> {
        await db.execute(
            "UPDATE moderation_cases SET status = 'appealed' WHERE id = ?",
            [id],
        );
    }
}
