import { AppealRepository } from "../Appeal/appeal.repository.js";
import { MovieRepository } from "../Movie/movie.repository.js";
import { SeriesRepository } from "../Series/series.repository.js";
import { ComplaintRepository } from "./complaint.repository.js";
import { CaseFilters, ReportTargetType } from "./complaint.entity.js";
import { ReportTypeRepository } from "../Report_Type/report_type.repository.js";

/** Number of distinct viewer reports required to open a moderation case. */
export const REPORTS_PER_COMPLAINT = 3;

/** Coordinates report and content-owner appeal rules. */
export class ReportService {
    constructor(
        private readonly reports = new ComplaintRepository(),
        private readonly appeals = new AppealRepository(),
        private readonly movies = new MovieRepository(),
        private readonly series = new SeriesRepository(),
        private readonly reportTypes = new ReportTypeRepository(),
    ) { }

    /**
     * Creates a report against an active movie or series.
     * The report type must exist, and types such as "Other" need details.
     */
    async createReport(input: {
        targetType: ReportTargetType;
        targetId: number;
        reporterId: number;
        reportTypeId: number;
        details: string | null;
    }) {
        const reportType = await this.reportTypes.findOne(input.reportTypeId);
        if (!reportType) return { error: "That report type does not exist" as const, invalid: true };
        if (reportType.requiresDetails && !input.details) {
            return { error: "Please explain the reason for this report" as const, invalid: true };
        }

        const result = await this.reports.submitReport({ ...input, reportType: reportType.name }, REPORTS_PER_COMPLAINT);
        if (result.error === "not_found") return { error: "Content not found" as const };
        if (result.error === "own_content") return { error: "You cannot report your own content" as const };
        if (result.error === "inactive") return { error: "Content is not active" as const };
        if (result.error === "duplicate") {
            return { error: "You have already reported this content" as const };
        }
        return {
            report: result.report!,
            reportCount: result.reportCount!,
            complaintCreated: result.complaintCreated,
        };
    }

    /** Lists moderation cases for administrators, with optional filters. */
    listCases(filters: CaseFilters) {
        return this.reports.findCases(filters);
    }

    /** Returns a case (with its content, owner, appeal and grouped reasons) and each of its reports. */
    async getReport(id: number) {
        const [detail, summary] = await Promise.all([
            this.reports.findWithReportCount(id),
            this.reports.findCases({ id }),
        ]);
        if (!detail || !summary[0]) return undefined;
        return { ...detail, summary: summary[0] };
    }

    /** Allows only the content owner to appeal a report against their content. */
    async createAppeal(input: {
        reportId: number;
        viewerId: number;
        description: string;
    }) {
        const report = await this.reports.findOne(input.reportId);
        if (!report) return { error: "Report not found" as const };
        if (report.status !== "pending") {
            return { error: "This report is not available for appeal" as const };
        }

        const target = await this.findTarget(report.targetType, report.targetId);
        if (!target || target.id_author !== input.viewerId) {
            return { error: "Only the content owner can appeal this report" as const };
        }

        const existingAppeal = await this.appeals.findByReport(report.id);
        if (existingAppeal) return { error: "An appeal already exists for this report" as const };

        const appeal = await this.appeals.create({
            description: input.description,
            reportId: report.id,
        });
        await this.reports.markAppealed(report.id);
        return { appeal };
    }

    /**
     * Withdraws an appeal that an administrator has not reviewed yet.
     * Only the owner of the reported content can do it.
     */
    async withdrawAppeal(input: { appealId: number; viewerId: number }): Promise<
        { error: string; status: 403 | 404 | 409 } | { withdrawn: true }
    > {
        const appeal = await this.appeals.findOne(input.appealId);
        if (!appeal) return { error: "Appeal not found" as const, status: 404 };

        const report = await this.reports.findOne(appeal.reportId);
        const target = report && await this.findTarget(report.targetType, report.targetId);
        if (!target || target.id_author !== input.viewerId) {
            return { error: "Only the content owner can withdraw this appeal" as const, status: 403 };
        }
        if (appeal.reviewed || !await this.appeals.withdraw(appeal.id)) {
            return { error: "This appeal was already reviewed" as const, status: 409 };
        }
        return { withdrawn: true };
    }

    private async findTarget(type: ReportTargetType, id: number) {
        return type === "movie"
            ? this.movies.findOne(id)
            : this.series.findOne(id);
    }
}
