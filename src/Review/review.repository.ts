import { Repository } from "../Shared/repository.js";
import { Review } from "./review.entity.js";

export class ReviewRepository implements Repository<Review>{
    
    async findAll(): Promise<Review[]> {
        throw new Error("Method not implemented.");
    }
    async findOne(id: number): Promise<Review | undefined> {
        throw new Error("Method not implemented.");
    }
    async create(item: Review): Promise<Review> {
        throw new Error("Method not implemented.");
    }
    async update(id: number, input: Partial<Review>): Promise<Review | undefined> {
        throw new Error("Method not implemented.");
    }
    async delete(id: number): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
}
