import { Repository } from "../Shared/repository.js";
import { Season } from "./season.entity.js";

export class TemporadaRepositorio implements Repository<Season> {
    
    async findAll(): Promise<Season[]> {
        throw new Error("Method not implemented.");
    }
    async findOne(id: number): Promise<Season | undefined> {
        throw new Error("Method not implemented.");
    }
    async create(item: Season): Promise<Season> {
        throw new Error("Method not implemented.");
    }
    async update(id: number, input: Partial<Season>): Promise<Season | undefined> {
        throw new Error("Method not implemented.");
    }
    async delete(id: number): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

}
