import { Repository } from "../Shared/repository.js";
import { Complaint } from "./complaint.entity.js";

export class ComplaintRepository implements Repository<Complaint>{
    
    async findAll(): Promise<Complaint[]> {
        throw new Error("Method not implemented.");
    }
    async findOne(id: number): Promise<Complaint | undefined> {
        throw new Error("Method not implemented.");
    }
    async create(item: Complaint): Promise<Complaint> {
        throw new Error("Method not implemented.");
    }
    async update(id: number, input: Partial<Complaint>): Promise<Complaint | undefined> {
        throw new Error("Method not implemented.");
    }
    async delete(id: number): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

}
