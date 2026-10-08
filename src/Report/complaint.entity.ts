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

/** An individual viewer report that contributes to a moderation case. */
export class ContentReport {
    constructor(
        public id: number,
        public targetType: ReportTargetType,
        public targetId: number,
        public reporterId: number,
        public reason: string,
    ) { }
}
