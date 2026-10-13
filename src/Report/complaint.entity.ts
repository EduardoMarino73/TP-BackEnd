/** Content types that viewers can report for moderation. */
export type ReportTargetType = "movie" | "series";

/** A moderation case generated after an audiovisual reaches the report threshold. */
export class Complaint {
    constructor(
        public id: number,
        public targetType: ReportTargetType,
        public targetId: number,
        public reportCount: number,
        public status: "pending" | "appealed" | "upheld" | "dismissed",
    ) { }
}

/**
 * An individual viewer report that contributes to a moderation case.
 * It has one report type ("Violence", "Other"...) and an optional explanation.
 */
export class ContentReport {
    constructor(
        public id: number,
        public targetType: ReportTargetType,
        public targetId: number,
        public reporterId: number,
        public reportTypeId: number,
        // name of the report type, for display
        public reportType: string,
        public details: string | null,
    ) { }
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
