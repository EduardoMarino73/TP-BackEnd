import { ObjectId } from "mongodb";
import { Repository } from "../Shared/repository.js";
import { Report_type } from "./report_type.entity.js";

export class Report_TypeRepository implements Repository<Report_type>{
    async findAll(): Promise<Report_type[] | undefined >{
        throw new Error("Method not implemented.");
    }
    async findOne(item: { id: string; }): Promise<Report_type | undefined> {
        throw new Error("Method not implemented.");
    }
    async add(item: Report_type): Promise<Report_type | undefined> {
        throw new Error("Method not implemented.");
    }
    async update(item: Report_type): Promise<Report_type | undefined> {
        throw new Error("Method not implemented.");
    }
    async delete(item: { id: string; }): Promise<{_id:ObjectId} | undefined> {
        throw new Error("Method not implemented.");
    }

}