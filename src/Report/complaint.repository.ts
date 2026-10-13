import { FilterQuery, LockMode, sql } from "@mikro-orm/core";
import { EntityManager } from "@mikro-orm/mysql";
import { orm } from "../Shared/database/connections.js";
import { Appeal } from "../Appeal/appeal.entity.js";
import { Movie } from "../Movie/movie.entity.js";
import { Serie } from "../Series/series.entity.js";
import { ReportType } from "../Report_Type/report_type.entity.js";
import {
    CaseFilters, Complaint, ContentReport, ModerationCaseSummary, ReasonCount, ReportTargetType,
} from "./complaint.entity.js";

/** A reported movie or series, as far as moderation needs it. */
type ReportedContent = Pick<Movie | Serie, "id" | "title" | "state" | "id_author" | "uploader_user_name">;

/** Loads the reported movie or series, in any state. lockMode locks its row until the transaction ends. */
export async function findContent(
    em: EntityManager,
    type: ReportTargetType,
    id: number,
    lockMode?: LockMode,
): Promise<Movie | Serie | null> {
    return type === "movie"
        ? em.findOne(Movie, id, { lockMode })
        : em.findOne(Serie, id, { lockMode });
}

/**
 * Conditions that match the reports or cases about content uploaded by a user
 * (an empty list when the user has uploaded nothing).
 */
export async function ownedContentTargets(
    em: EntityManager,
    ownerId: number,
): Promise<Array<{ targetType: ReportTargetType; targetId: { $in: number[] } }>> {
    const movies = await em.find(Movie, { id_author: ownerId });
    const series = await em.find(Serie, { id_author: ownerId });
    const targets: Array<{ targetType: ReportTargetType; targetId: { $in: number[] } }> = [];
    if (movies.length > 0) targets.push({ targetType: "movie", targetId: { $in: movies.map((movie) => movie.id!) } });
    if (series.length > 0) targets.push({ targetType: "series", targetId: { $in: series.map((serie) => serie.id!) } });
    return targets;
}

/** The movie or series a case is about, as the summary shows it. */
function toCaseSummary(
    complaint: Complaint,
    content: ReportedContent | undefined,
    appeal: Appeal | undefined,
    reasons: ReasonCount[],
): ModerationCaseSummary {
    return {
        id: complaint.id,
        targetType: complaint.targetType,
        targetId: complaint.targetId,
        reportCount: complaint.reportCount,
        status: complaint.status,
        createdAt: complaint.createdAt!,
        content: {
            title: content?.title ?? null,
            state: content?.state ?? null,
            ownerId: content?.id_author ?? null,
            ownerUsername: content?.uploader_user_name ?? null,
        },
        reasons,
        appeal: appeal ? {
            id: appeal.id,
            description: appeal.description,
            reviewed: appeal.reviewed,
            decision: appeal.decision,
        } : null,
    };
}

/** Stores individual reports and threshold-based moderation cases. */
export class ComplaintRepository {
    /** The EntityManager of the current request (see RequestContext in index.ts). */
    private get em() {
        return orm.em;
    }

    /** Returns all moderation cases. */
    async findAll(): Promise<Complaint[]> {
        return this.em.find(Complaint, {}, { orderBy: { id: "asc" } });
    }

    /** Finds a moderation case by its ID. */
    async findOne(id: number): Promise<Complaint | undefined> {
        return (await this.em.findOne(Complaint, id)) ?? undefined;
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
        // everything inside runs in one transaction: it commits at the end, or rolls back on an error
        return this.em.transactional(async (em) => {
            const target = { targetType: input.targetType, targetId: input.targetId };
            const content = await findContent(em, input.targetType, input.targetId, LockMode.PESSIMISTIC_WRITE);

            if (!content) return { error: "not_found" as const };
            if (content.id_author === input.reporterId) return { error: "own_content" as const };
            if (content.state !== "active") return { error: "inactive" as const };

            if (await em.count(ContentReport, { ...target, reporterId: input.reporterId }) > 0) {
                return { error: "duplicate" as const };
            }

            const report = new ContentReport(
                input.targetType,
                input.targetId,
                input.reporterId,
                input.reportTypeId,
                input.reportType,
                input.details,
            );
            await em.persist(report).flush();

            const reportCount = await em.count(ContentReport, target);
            let complaintCreated: Complaint | undefined;

            if (reportCount >= threshold && await em.count(Complaint, target) === 0) {
                complaintCreated = new Complaint(input.targetType, input.targetId, reportCount);
                await em.persist(complaintCreated).flush();
            }

            return { report, reportCount, complaintCreated };
        });
    }

    /** Returns a case, the current total reports for its audiovisual and each of those reports. */
    async findWithReportCount(id: number) {
        const complaint = await this.findOne(id);
        if (!complaint) return undefined;

        const target = { targetType: complaint.targetType, targetId: complaint.targetId };
        const reports = await this.em.find(ContentReport, target, { orderBy: { id: "asc" } });
        return {
            complaint,
            reportCount: reports.length,
            reports,
        };
    }

    /** Counts reports against audiovisual content owned by a viewer. */
    async countReceivedByViewer(viewerId: number): Promise<number> {
        const targets = await ownedContentTargets(this.em, viewerId);
        if (targets.length === 0) return 0;
        return this.em.count(ContentReport, { $or: targets });
    }

    /** Changes a moderation case's status. */
    async setStatus(id: number, status: Complaint["status"]): Promise<void> {
        await this.em.nativeUpdate(Complaint, { id }, { status });
    }

    /**
     * Lists moderation cases with their content, owner, appeal and reasons grouped by type.
     * Every filter is optional; the newest cases come first.
     */
    async findCases(filters: CaseFilters = {}): Promise<ModerationCaseSummary[]> {
        const conditions: FilterQuery<Complaint>[] = [];
        if (filters.id !== undefined) conditions.push({ id: filters.id });
        if (filters.status !== undefined) conditions.push({ status: filters.status });
        if (filters.ownerId !== undefined) {
            const targets = await ownedContentTargets(this.em, filters.ownerId);
            if (targets.length === 0) return [];
            conditions.push({ $or: targets });
        }
        if (filters.reportTypeId !== undefined) {
            const reports = await this.em.find(ContentReport, { reportTypeId: filters.reportTypeId });
            if (reports.length === 0) return [];
            conditions.push({
                $or: reports.map((report) => ({ targetType: report.targetType, targetId: report.targetId })),
            });
        }

        const cases = await this.em.find(Complaint, { $and: conditions }, { orderBy: { id: "desc" } });
        if (cases.length === 0) return [];

        // the content, appeal and reasons of every listed case
        const idsOf = (type: ReportTargetType) => cases
            .filter((complaint) => complaint.targetType === type)
            .map((complaint) => complaint.targetId);
        const movies = await this.em.find(Movie, { id: { $in: idsOf("movie") } });
        const series = await this.em.find(Serie, { id: { $in: idsOf("series") } });
        const appeals = await this.em.find(Appeal, { reportId: { $in: cases.map((complaint) => complaint.id) } });
        const reasons = await this.reasonsByTarget(cases);

        const contentByTarget = new Map<string, ReportedContent>([
            ...movies.map((movie) => [`movie:${movie.id}`, movie] as const),
            ...series.map((serie) => [`series:${serie.id}`, serie] as const),
        ]);
        const appealByCase = new Map(appeals.map((appeal) => [appeal.reportId, appeal]));

        return cases.map((complaint) => {
            const key = `${complaint.targetType}:${complaint.targetId}`;
            return toCaseSummary(
                complaint,
                contentByTarget.get(key),
                appealByCase.get(complaint.id),
                reasons.get(key) ?? [],
            );
        });
    }

    /**
     * Counts the reports of each case's content by report type, most frequent first.
     * The QueryBuilder groups and counts in the database.
     */
    private async reasonsByTarget(cases: Complaint[]): Promise<Map<string, ReasonCount[]>> {
        const rows = await this.em.createQueryBuilder(ContentReport, "r")
            .select(["r.targetType", "r.targetId", "r.reportTypeId", sql`count(*)`.as("total")])
            .where({ $or: cases.map((complaint) => ({ targetType: complaint.targetType, targetId: complaint.targetId })) })
            .groupBy(["r.targetType", "r.targetId", "r.reportTypeId"])
            .execute<Array<{ targetType: ReportTargetType; targetId: number; reportTypeId: number; total: number }>>("all");

        const types = await this.em.find(ReportType, { id: { $in: rows.map((row) => row.reportTypeId) } });
        const nameById = new Map(types.map((type) => [type.id, type.name]));

        const reasons = new Map<string, ReasonCount[]>();
        rows.forEach((row) => {
            const key = `${row.targetType}:${row.targetId}`;
            const list = reasons.get(key) ?? [];
            list.push({
                reportTypeId: row.reportTypeId,
                reportType: nameById.get(row.reportTypeId) ?? "",
                count: Number(row.total),
            });
            reasons.set(key, list);
        });
        reasons.forEach((list) => list.sort((a, b) => b.count - a.count || a.reportType.localeCompare(b.reportType)));
        return reasons;
    }

    /** Marks a case as awaiting administrator review. */
    async markAppealed(id: number): Promise<void> {
        await this.em.nativeUpdate(Complaint, { id }, { status: "appealed" });
    }
}
