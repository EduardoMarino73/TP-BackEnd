import { Repository } from "../Shared/repository.js";
import { Appeal } from "../Appeal/appeal.entity.js";
import { ObjectId } from "mongodb";

export class AppealRepository implements Repository<Appeal>{
    
    async findAll(): Promise<Appeal[] | undefined> {
        throw new Error("Method not implemented.");
    }
    async findOne(item: { id: string; }): Promise<Appeal | undefined> {
        throw new Error("Method not implemented.");
    }
    async add(item: Appeal): Promise<Appeal | undefined> {
        throw new Error("Method not implemented.");
    }
    async update(item: Appeal): Promise<Appeal | undefined> {
        throw new Error("Method not implemented.");
    }
    async delete(item: { id: string; }): Promise<{_id:ObjectId} | undefined> {
        return /*fix this */
    }

}