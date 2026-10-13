import { orm } from "../Shared/database/connections.js";
import { Repository } from "../Shared/repository.js";
import { AudiovisualType, Review } from "./review.entity.js";

export class ReviewRepository implements Repository<Review> {
    /** The EntityManager of the current request (see RequestContext in index.ts). */
    private get em() {
        return orm.em;
    }

    /** Returns all reviews ordered by their ID. */
    async findAll(): Promise<Review[]> {
        return this.em.find(Review, {}, { orderBy: { id: "asc" } });
    }

    /** Finds a review by its primary key. */
    async findOne(id: number): Promise<Review | undefined> {
        return (await this.em.findOne(Review, id)) ?? undefined;
    }

    /** Lists ratings linked to a specific movie or episode. */
    async findByAudiovisual(type: AudiovisualType, audiovisualId: number): Promise<Review[]> {
        return this.em.find(Review, { audiovisualType: type, audiovisualId }, { orderBy: { id: "asc" } });
    }

    /** Lists all ratings submitted by a viewer. */
    async findByViewer(viewerId: number): Promise<Review[]> {
        return this.em.find(Review, { viewerId }, { orderBy: { id: "asc" } });
    }

    /** Saves a review. Fails with ER_DUP_ENTRY when the viewer already rated that content. */
    async create(item: Review): Promise<Review> {
        await this.em.persist(item).flush();
        return item;
    }

    /** Only the rating can change: the viewer and the rated content are fixed. */
    async update(id: number, input: Partial<Review>): Promise<Review | undefined> {
        const review = await this.findOne(id);
        if (!review) return undefined;
        if (input.rating !== undefined) review.rating = input.rating;
        await this.em.flush();
        return review;
    }

    /** Deletes the requested review and reports whether it existed. */
    async delete(id: number): Promise<boolean> {
        return (await this.em.nativeDelete(Review, { id })) > 0;
    }
}
