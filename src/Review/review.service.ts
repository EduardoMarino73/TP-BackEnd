import { Review, AudiovisualType } from "./review.entity.js";
import { ReviewRepository } from "./review.repository.js";

/** Prevents empty, decimal, or non-positive IDs from reaching the repository. */
const validId = (value: string) => /^\d+$/.test(value) && Number(value) > 0;

/** Coordinates ID validation and access to the review repository. */
export class ReviewService {
    constructor(private readonly repository: ReviewRepository) {}

    /** Query, write, and delete operations delegated to the persistence layer. */
    findAll() { 
        return this.repository.findAll(); 
    }

    findOne(id: string) { 
        return validId(id) ? this.repository.findOne(Number(id)) : Promise.resolve(undefined); 
    }

    findByViewer(viewerId: string) { 
        return validId(viewerId) ? this.repository.findByViewer(Number(viewerId)) : Promise.resolve(undefined); 
    }

    findByAudiovisual(type: AudiovisualType, id: string) {
        return validId(id) ? this.repository.findByAudiovisual(type, Number(id)) : Promise.resolve(undefined);
    }
    create(review: Review) { 
        return this.repository.create(review); 
    }

    update(id: string, input: Partial<Review>) { 
        return validId(id) ? this.repository.update(Number(id), input) : Promise.resolve(undefined); 
    }

    remove(id: string) { 
        return validId(id) ? this.repository.delete(Number(id)) : Promise.resolve(false); 
    }
}
