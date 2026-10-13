import { Entity, Enum, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Complaint } from "../Report/complaint.entity.js";
import { Administrator } from "../User_Folder/administrator/administrator.entity.js";

/** Represents an appeal submitted for a moderation report, mapped to the content_appeals table. */
@Entity({ tableName: "content_appeals" })
export class Appeal {
    @PrimaryKey()
    id!: number;

    @Property({ length: 2000 })
    description: string;

    /** The appealed moderation case, kept as its id (content_appeals.moderation_case_id). */
    @ManyToOne(() => Complaint, { fieldName: "moderation_case_id", mapToPk: true })
    reportId: number;

    /** The administrator who reviewed it, kept as its id; null until it is reviewed. */
    @ManyToOne(() => Administrator, { fieldName: "administrator_id", mapToPk: true, nullable: true })
    administratorId: number | null = null;

    @Property()
    reviewed = false;

    @Enum({ items: ["approved", "rejected"], nullable: true })
    decision: "approved" | "rejected" | null = null;

    @Property({ hidden: true, nullable: true })
    reviewedAt?: Date;

    constructor(description: string, reportId: number) {
        this.description = description;
        this.reportId = reportId;
    }
}
