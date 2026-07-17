import { ObjectId } from "mongodb";
import { Repository } from "../Shared/repository.js";
import { Denuncia } from "./complaint.entity.js";

export class ComplaintRepository implements Repository<Denuncia>{
    
    async findAll(): Promise<Denuncia[] | undefined> {
        throw new Error("Method not implemented.");
    }
    async findOne(item: { id: string; }): Promise<Denuncia | undefined> {
        throw new Error("Method not implemented.");
    }
    async create(item: Denuncia): Promise<Denuncia | undefined> {
        throw new Error("Method not implemented.");
    }
    async update(item: Denuncia): Promise<Denuncia | undefined> {
        throw new Error("Method not implemented.");
    }
    async delete(item: { id: string; }): Promise<{_id:ObjectId} | undefined> {
        return /*remember fix this method */
    }

}