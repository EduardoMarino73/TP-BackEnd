/**
 * One reason a viewer can choose when reporting content ("Violence", "Other"...).
 * The catalog is managed by administrators. When requiresDetails is true
 * (for example "Other"), the report must also include a text explaining it.
 */
export class ReportType {
    constructor(
        public name: string,
        public requiresDetails: boolean = false,
        public id?: number,
    ) {}
}
