import { orm } from "../Shared/database/connections.js";
import { pickDefined, Repository } from "../Shared/repository.js";
import { ReportType } from "./report_type.entity.js";

/** Database access for the catalog of report reasons, through the ORM. */
export class ReportTypeRepository implements Repository<ReportType>{
    /** The EntityManager of the current request (see RequestContext in index.ts). */
    private get em() {
        return orm.em;
    }

    /** Fixed reasons first (alphabetically), then the ones that need details, such as "Other". */
    async findAll(): Promise<ReportType[]> {
        return this.em.find(ReportType, {}, { orderBy: { requiresDetails: "asc", name: "asc" } });
    }

    async findOne(id: number): Promise<ReportType | undefined> {
        return (await this.em.findOne(ReportType, id)) ?? undefined;
    }

    /** Fails with ER_DUP_ENTRY when another type has that name. */
    async create(item: ReportType): Promise<ReportType> {
        await this.em.persist(item).flush();
        return item;
    }

    async update(id: number, input: Partial<ReportType>): Promise<ReportType | undefined> {
        const reportType = await this.findOne(id);
        if (!reportType) return undefined;
        this.em.assign(reportType, pickDefined(input, ["name", "requiresDetails"] as const));
        await this.em.flush();
        return reportType;
    }

    /** Fails with ER_ROW_IS_REFERENCED_2 when a report already uses this type. */
    async delete(id: number): Promise<boolean> {
        return (await this.em.nativeDelete(ReportType, { id })) > 0;
    }
}
