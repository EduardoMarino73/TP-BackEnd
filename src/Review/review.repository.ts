import { ObjectId } from "mongodb";
import { Repository } from "../Shared/repository.js";
import { Review } from "./review.entity.js";

export class ReviewRepository implements Repository<Review>{
    
    async findAll(): Promise<Review[] | undefined> {
        return 
    }
    async findOne(item: { id: string; }): Promise<Review | undefined> {
        throw new Error("Method not implemented.");
    }
    async create(item: Review): Promise<Review | undefined> {
        throw new Error("Method not implemented.");
    }
    async update(item: Review): Promise<Review | undefined> {
        throw new Error("Method not implemented.");
    }
    async delete(item: { id: string; }): Promise<{_id:ObjectId} | undefined> {
        return 
    }
} 