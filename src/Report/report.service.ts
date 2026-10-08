import { AppealRepository } from "../Appeal/appeal.repository.js";
import { MovieRepository } from "../Movie/movie.repository.js";
import { SeriesRepository } from "../Series/series.repository.js";
import { ComplaintRepository } from "./complaint.repository.js";
import { ReportTargetType } from "./complaint.entity.js";

/** Number of distinct viewer reports required to open a moderation case. */
export const REPORTS_PER_COMPLAINT = 3;

/** Coordinates report and content-owner appeal rules. */
export class ReportService {
    constructor(
        private readonly reports = new ComplaintRepository(),
        private readonly appeals = new AppealRepository(),
        private readonly movies = new MovieRepository(),
        private readonly series = new SeriesRepository(),
    ) { }

    /** Creates a report against an active movie or series. */
    async createReport(input: {
        targetType: ReportTargetType;
        targetId: number;
        reporterId: number;
        reason: string;
    }) {
        const result = await this.reports.submitReport(input, REPORTS_PER_COMPLAINT);
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

    /** Returns a report with the current number of reports for its content. */
    async getReport(id: number) {
        return this.reports.findWithReportCount(id);
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

    private async findTarget(type: ReportTargetType, id: number) {
        return type === "movie"
            ? this.movies.findOne(id)
            : this.series.findOne(id);
    }
}
