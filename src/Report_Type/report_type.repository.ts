import { Repository } from "../Shared/repository.js";
import { ReportType } from "./report_type.entity.js";

export class ReportTypeRepository implements Repository<ReportType>{
    async findAll(): Promise<ReportType[]> {
        throw new Error("Method not implemented.");
    }
    async findOne(id: number): Promise<ReportType | undefined> {
        throw new Error("Method not implemented.");
    }
    async create(item: ReportType): Promise<ReportType> {
        throw new Error("Method not implemented.");
    }
    async update(id: number, input: Partial<ReportType>): Promise<ReportType | undefined> {
        throw new Error("Method not implemented.");
    }
    async delete(id: number): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

}
