import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

/**
 * One reason a viewer can choose when reporting content ("Violence", "Other"...).
 * The catalog is managed by administrators. When requiresDetails is true
 * (for example "Other"), the report must also include a text explaining it.
 * Mapped to the report_types table.
 */
@Entity({ tableName: "report_types" })
export class ReportType {
    @PrimaryKey()
    id?: number;

    @Property({ length: 100 })
    name: string;

    @Property()
    requiresDetails: boolean;

    constructor(name: string, requiresDetails = false) {
        this.name = name;
        this.requiresDetails = requiresDetails;
    }
}
