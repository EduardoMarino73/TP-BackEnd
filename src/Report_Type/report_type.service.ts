import { ReportType } from "./report_type.entity.js";
import { ReportTypeRepository } from "./report_type.repository.js";

/** Rules for the catalog of report reasons. */
export class ReportTypeService {
    constructor(private readonly repository = new ReportTypeRepository()) {}

    findAll(): Promise<ReportType[]> {
        return this.repository.findAll();
    }

    findOne(id: number): Promise<ReportType | undefined> {
        if (!Number.isSafeInteger(id) || id < 1) return Promise.resolve(undefined);
        return this.repository.findOne(id);
    }

    create(input: { name: string; requiresDetails?: boolean }): Promise<ReportType> {
        return this.repository.create(new ReportType(input.name, input.requiresDetails ?? false));
    }

    async update(id: number, input: Partial<Pick<ReportType, "name" | "requiresDetails">>): Promise<ReportType | undefined> {
        if (!await this.findOne(id)) return undefined;
        return this.repository.update(id, input);
    }

    remove(id: number): Promise<boolean> {
        if (!Number.isSafeInteger(id) || id < 1) return Promise.resolve(false);
        return this.repository.delete(id);
    }
}
