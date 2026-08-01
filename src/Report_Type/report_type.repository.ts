import { Repository } from "../Shared/repository.js";
import { Report_type } from "./report_type.entity.js";

export class Report_TypeRepository implements Repository<Report_type>{
    async findAll(): Promise<Report_type[]> {
        throw new Error("Method not implemented.");
    }
    async findOne(id: number): Promise<Report_type | undefined> {
        throw new Error("Method not implemented.");
    }
    async create(item: Report_type): Promise<Report_type> {
        throw new Error("Method not implemented.");
    }
    async update(id: number, input: Partial<Report_type>): Promise<Report_type | undefined> {
        throw new Error("Method not implemented.");
    }
    async delete(id: number): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

}
