import { Episode } from "./episode.entity.js";
import { Repository } from "../Shared/repository.js";

/**
 * Service layer for Episode business logic.
 */
export class EpisodeService {
    public constructor(private repo: Repository<Episode> & { 
        findBySeason(id_season: number): Promise<Episode[]> 
    }) {}

    /**
     * Looks up an episode by ID with integer validation.
     */
    findOne(id: string): Promise<Episode | undefined> {
        const episodeId = Number(id);
        if (!Number.isInteger(episodeId) || episodeId < 1) return Promise.resolve(undefined);
        return this.repo.findOne(episodeId);
    }

    /**
     * Returns all episodes in the system.
     */
    async findAll(): Promise<Episode[]> {
        return await this.repo.findAll();
    }

    /**
     * Retrieves all episodes associated with a given season ID.
     */
    async findBySeason(seasonId: string): Promise<Episode[]> {
        const id_Season = Number(seasonId);
        if (!Number.isInteger(id_Season) || id_Season < 1) return Promise.resolve([]);
        return await this.repo.findBySeason(id_Season);
    }

    /**
     * Constructs and saves a new Episode entity.
     */
    async create(input: Omit<Episode, "id">): Promise<Episode> {
        const episode = new Episode(
            input.id_season,
            input.episode_number,
            input.title,
            input.description,
            input.path,
            input.id_author,
            input.views ?? 0,
            input.state ?? "active"
        );
        return this.repo.create(episode);
    }

    /**
     * Updates an existing episode with partial data.
     */
    update(id: string, input: Partial<Episode>): Promise<Episode | undefined> {
        const episodeId = Number(id);
        if (!Number.isInteger(episodeId) || episodeId < 1) return Promise.resolve(undefined);
        return this.repo.update(episodeId, input);
    }

    /**
     * Removes an episode by ID.
     */
    remove(id: string): Promise<boolean> {
        const episodeId = Number(id);
        if (!Number.isInteger(episodeId) || episodeId < 1) return Promise.resolve(false);
        return this.repo.delete(episodeId);
    }
}
