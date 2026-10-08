/** Represents an appeal submitted for a moderation report. */
export class Appeal {
    constructor(
        public id: number,
        public description: string,
        public reportId: number,
        public administratorId: number | null,
        public reviewed: boolean,
        public decision: "approved" | "rejected" | null = null,
    ) { }
}
