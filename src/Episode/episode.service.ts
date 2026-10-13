import { Episode } from "./episode.entity.js";
import { Repository } from "../Shared/repository.js";
import { SeasonRepository } from "../Season/season.repository.js";
import { SeriesRepository } from "../Series/series.repository.js";
import { OwnedResult, whenOwner } from "../Shared/ownership.js";

/** Fields of a new episode; the author comes from the token and the path from the uploaded file. */
export type NewEpisode = Pick<Episode, "id_season" | "episode_number" | "title" | "path" | "id_author"> & {
    description?: string;
    thumbnail_path?: string | null;
    duration?: number | null;
};

/** Fields that can change in an episode. */
export type EpisodeChanges = Partial<Pick<Episode, "episode_number" | "title" | "description">>;

/**
 * Service layer for Episode business logic.
 */
export class EpisodeService {
    public constructor(
        private repo: Repository<Episode> & {
            findBySeason(id_season: number): Promise<Episode[]>
        },
        private seasons = new SeasonRepository(),
        private series = new SeriesRepository(),
    ) {}

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
     * Saves a new episode in a season of a series that the uploader owns.
     * New episodes always start active and with no views.
     */
    async create(input: NewEpisode): Promise<OwnedResult<Episode>> {
        const season = await this.seasons.findOne(input.id_season);
        const serie = season && await this.series.findOne(season.id_serie);
        const episode = new Episode(
            input.id_season,
            input.episode_number,
            input.title,
            input.description ?? "",
            input.path,
            input.id_author,
            0,
            "active"
        );
        episode.thumbnail_path = input.thumbnail_path ?? null;
        episode.duration = input.duration ?? null;
        return whenOwner(serie, input.id_author, () => this.repo.create(episode));
    }

    /**
     * Updates an existing episode with partial data. Only its uploader can do it.
     */
    async update(id: string, input: EpisodeChanges, userId: number): Promise<OwnedResult<Episode>> {
        const episode = await this.findOne(id);
        return whenOwner(episode, userId, (found) => this.repo.update(found.id!, input));
    }

    /**
     * Removes an episode by ID. Only its uploader can do it.
     */
    async remove(id: string, userId: number): Promise<OwnedResult<true>> {
        const episode = await this.findOne(id);
        return whenOwner(episode, userId, async (found) => (
            await this.repo.delete(found.id!) ? true : undefined
        ));
    }
}
