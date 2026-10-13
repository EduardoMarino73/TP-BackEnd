import { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "../Shared/database/connections.js";
import { Repository } from "../Shared/repository.js";
import { ReportType } from "./report_type.entity.js";

/** Shape of a row from the report_types table. */
type ReportTypeRow = RowDataPacket & {
    id: number;
    name: string;
    requires_details: number;
};

const toReportType = (row: ReportTypeRow) => new ReportType(row.name, Boolean(row.requires_details), row.id);

/** Database access for the catalog of report reasons. */
export class ReportTypeRepository implements Repository<ReportType>{
    /** Fixed reasons first (alphabetically), then the ones that need details, such as "Other". */
    async findAll(): Promise<ReportType[]> {
        const [rows] = await db.query<ReportTypeRow[]>(
            "SELECT id, name, requires_details FROM report_types ORDER BY requires_details, name",
        );
        return rows.map(toReportType);
    }

    async findOne(id: number): Promise<ReportType | undefined> {
        const [rows] = await db.execute<ReportTypeRow[]>(
            "SELECT id, name, requires_details FROM report_types WHERE id = ?",
            [id],
        );
        return rows[0] ? toReportType(rows[0]) : undefined;
    }

    async create(item: ReportType): Promise<ReportType> {
        const [result] = await db.execute<ResultSetHeader>(
            "INSERT INTO report_types (name, requires_details) VALUES (?, ?)",
            [item.name, item.requiresDetails],
        );
        item.id = result.insertId;
        return item;
    }

    async update(id: number, input: Partial<ReportType>): Promise<ReportType | undefined> {
        const columns = { name: "name", requiresDetails: "requires_details" } as const;
        const fields = (Object.keys(columns) as Array<keyof typeof columns>)
            .filter((field) => input[field] !== undefined);
        if (fields.length > 0) {
            await db.execute(
                `UPDATE report_types SET ${fields.map((field) => `${columns[field]} = ?`).join(", ")} WHERE id = ?`,
                [...fields.map((field) => input[field] as string | boolean), id],
            );
        }
        return this.findOne(id);
    }

    /** Fails with ER_ROW_IS_REFERENCED_2 when a report already uses this type. */
    async delete(id: number): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>("DELETE FROM report_types WHERE id = ?", [id]);
        return result.affectedRows > 0;
    }
}
