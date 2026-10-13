import { Review, AudiovisualType } from "./review.entity.js";
import { ReviewRepository } from "./review.repository.js";
import { MovieRepository } from "../Movie/movie.repository.js";
import { EpisodeRepository } from "../Episode/episode.repository.js";
import { OwnedResult, whenOwner } from "../Shared/ownership.js";

/** Prevents empty, decimal, or non-positive IDs from reaching the repository. */
const validId = (value: string) => /^\d+$/.test(value) && Number(value) > 0;

/** The viewer who wrote a review owns it. */
const viewerOf = (review: Review) => review.viewerId;

/** Coordinates ID validation and access to the review repository. */
export class ReviewService {
    constructor(
        private readonly repository: ReviewRepository,
        private readonly movies = new MovieRepository(),
        private readonly episodes = new EpisodeRepository(),
    ) {}

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

    /** Saves a rating of an active movie or episode. Returns undefined when that content does not exist. */
    async create(review: Review): Promise<Review | undefined> {
        const content = review.audiovisualType === "movie"
            ? await this.movies.findOne(review.audiovisualId)
            : await this.episodes.findOne(review.audiovisualId);
        if (!content) return undefined;
        return this.repository.create(review);
    }

    /** Changes the rating. Only the viewer who wrote it can do it. */
    async update(id: string, rating: boolean, userId: number): Promise<OwnedResult<Review>> {
        const review = await this.findOne(id);
        return whenOwner(review, userId, (found) => this.repository.update(found.id!, { rating }), viewerOf);
    }

    /** Withdraws a rating. Only the viewer who wrote it can do it. */
    async remove(id: string, userId: number): Promise<OwnedResult<true>> {
        const review = await this.findOne(id);
        return whenOwner(review, userId, async (found) => (
            await this.repository.delete(found.id!) ? true : undefined
        ), viewerOf);
    }
}
