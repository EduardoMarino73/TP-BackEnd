import { ObjectId } from "mongodb";
import { Repository } from "../Shared/repository.js";
import { Season } from "./season.entity.js";

export class TemporadaRepositorio implements Repository<Season> {
    
    async findAll(): Promise<Season[] | undefined> {
        throw new Error("Method not implemented.");
    }
    async findOne(item: { id: string; }): Promise<Season | undefined> {
        throw new Error("Method not implemented.");
    }
    async create(item: Season): Promise<Season | undefined> {
        throw new Error("Method not implemented.");
    }
    async update(item: Season): Promise<Season | undefined> {
        throw new Error("Method not implemented.");
    }
    async delete(item: { id: string; }): Promise<{_id:ObjectId} | undefined> {
        throw new Error("Method not implemented.");
    }

}