import { Repository } from "../Shared/repository.js";
import { Appeal } from "../Appeal/appeal.entity.js";

export class AppealRepository implements Repository<Appeal>{
    
    async findAll(): Promise<Appeal[]> {
        throw new Error("Method not implemented.");
    }
    async findOne(id: number): Promise<Appeal | undefined> {
        throw new Error("Method not implemented.");
    }
    async create(item: Appeal): Promise<Appeal> {
        throw new Error("Method not implemented.");
    }
    async update(id: number, input: Partial<Appeal>): Promise<Appeal | undefined> {
        throw new Error("Method not implemented.");
    }
    async delete(id: number): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

}
