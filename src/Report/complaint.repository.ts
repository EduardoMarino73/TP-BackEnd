import { Repository } from "../Shared/repository.js";
import { Denuncia } from "./complaint.entity.js";

export class ComplaintRepository implements Repository<Denuncia>{
    
    async findAll(): Promise<Denuncia[]> {
        throw new Error("Method not implemented.");
    }
    async findOne(id: number): Promise<Denuncia | undefined> {
        throw new Error("Method not implemented.");
    }
    async create(item: Denuncia): Promise<Denuncia> {
        throw new Error("Method not implemented.");
    }
    async update(id: number, input: Partial<Denuncia>): Promise<Denuncia | undefined> {
        throw new Error("Method not implemented.");
    }
    async delete(id: number): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

}
