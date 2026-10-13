import { Entity, Enum, Formula, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { ReportType } from "../Report_Type/report_type.entity.js";
import { Viewer } from "../User_Folder/viewer/viewer.entity.js";

/** Content types that viewers can report for moderation. */
export type ReportTargetType = "movie" | "series";

/**
 * A moderation case generated after an audiovisual reaches the report threshold.
 * Mapped to the moderation_cases table.
 */
@Entity({ tableName: "moderation_cases" })
export class Complaint {
    @PrimaryKey()
    id!: number;

    @Enum({ items: ["movie", "series"] })
    targetType: ReportTargetType;

    @Property({ type: "integer" })
    targetId: number;

    @Property({ type: "integer" })
    reportCount: number;

    @Enum({ items: ["pending", "appealed", "upheld", "dismissed"] })
    status: "pending" | "appealed" | "upheld" | "dismissed";

    /** Set by the database; only used in case summaries. */
    @Property({ hidden: true, nullable: true })
    createdAt?: Date;

    constructor(targetType: ReportTargetType, targetId: number, reportCount: number) {
        this.targetType = targetType;
        this.targetId = targetId;
        this.reportCount = reportCount;
        this.status = "pending";
    }
}

/**
 * An individual viewer report that contributes to a moderation case.
 * It has one report type ("Violence", "Other"...) and an optional explanation.
 * Mapped to the content_reports table.
 */
@Entity({ tableName: "content_reports" })
export class ContentReport {
    @PrimaryKey()
    id!: number;

    @Enum({ items: ["movie", "series"] })
    targetType: ReportTargetType;

    @Property({ type: "integer" })
    targetId: number;

    /** The viewer who reported, kept as its id. */
    @ManyToOne(() => Viewer, { fieldName: "reporter_id", mapToPk: true })
    reporterId: number;

    /** The report type, kept as its id. */
    @ManyToOne(() => ReportType, { fieldName: "report_type_id", mapToPk: true })
    reportTypeId: number;

    /** Name of the report type, for display; read from report_types. */
    @Formula(({ alias }) => `(SELECT t.name FROM report_types AS t WHERE t.id = ${alias}.report_type_id)`, { type: "string" })
    reportType: string;

    @Property({ type: "string", length: 1000, nullable: true })
    details: string | null;

    constructor(
        targetType: ReportTargetType,
        targetId: number,
        reporterId: number,
        reportTypeId: number,
        reportType: string,
        details: string | null,
    ) {
        this.targetType = targetType;
        this.targetId = targetId;
        this.reporterId = reporterId;
        this.reportTypeId = reportTypeId;
        this.reportType = reportType;
        this.details = details;
    }
}

/** How many reports of one type a case has. */
export type ReasonCount = { reportTypeId: number; reportType: string; count: number };

/** Filters for listing moderation cases. */
export type CaseFilters = {
    id?: number;
    status?: Complaint["status"];
    reportTypeId?: number;
    // only cases about content uploaded by this user
    ownerId?: number;
};

/**
 * A moderation case with what is needed to show it in a list or a detail:
 * the reported content and its owner, the reasons grouped by type, and the appeal if there is one.
 */
export type ModerationCaseSummary = {
    id: number;
    targetType: ReportTargetType;
    targetId: number;
    reportCount: number;
    status: Complaint["status"];
    createdAt: Date;
    content: {
        title: string | null;
        // 'active', 'suspended' or 'deleted'
        state: string | null;
        ownerId: number | null;
        ownerUsername: string | null;
    };
    reasons: ReasonCount[];
    appeal: {
        id: number;
        description: string;
        reviewed: boolean;
        decision: "approved" | "rejected" | null;
    } | null;
};
