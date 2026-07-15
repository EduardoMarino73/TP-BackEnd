import { ObjectId } from "mongodb";
import { Repository } from "../../Shared/repository.js";
import { Administrator } from "./administrator.entity.js";

export class AdministratorRepository implements Repository<Administrator>{
    
    async findAll(): Promise<Administrator[] | undefined> {
        throw new Error("Method not implemented.");
    }
    async findOne(item: { id: string; }): Promise<Administrator | undefined> {
        throw new Error("Method not implemented.");
    }
    async add(item: Administrator): Promise<Administrator | undefined> {
        throw new Error("Method not implemented.");
    }
    async update(item: Administrator): Promise<Administrator | undefined> {
        throw new Error("Method not implemented.");
    }
    async delete(item: { id: string; }): Promise<{_id:ObjectId} | undefined> {
        throw new Error("Method not implemented.");
    }

}