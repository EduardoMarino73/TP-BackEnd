import { Repository } from "../../Shared/repository.js";
import { Administrator } from "./administrator.entity.js";

export class AdministratorRepository implements Repository<Administrator>{
    
    async findAll(): Promise<Administrator[]> {
        throw new Error("Method not implemented.");
    }
    async findOne(id: number): Promise<Administrator | undefined> {
        throw new Error("Method not implemented.");
    }
    async create(item: Administrator): Promise<Administrator> {
        throw new Error("Method not implemented.");
    }
    async update(id: number, input: Partial<Administrator>): Promise<Administrator | undefined> {
        throw new Error("Method not implemented.");
    }
    async delete(id: number): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

}
