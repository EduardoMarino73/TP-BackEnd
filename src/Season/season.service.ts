import { Season } from "./season.entity.js";
import { SeasonRepository } from "./season.repository.js";
import { SeriesRepository } from "../Series/series.repository.js";
import { OwnedResult, whenOwner } from "../Shared/ownership.js";

/** Fields of a new season. */
export type NewSeason = Pick<Season, "id_serie" | "season_number"> & { description?: string };

/** Fields that can change in a season (it cannot move to another series). */
export type SeasonChanges = Partial<Pick<Season, "season_number" | "description">>;

/**
 * Service layer responsible for business rules and operations on Seasons.
 * A season has no author of its own: the owner is the user who uploaded its series.
 */
export class SeasonService {
    public constructor(
        private repo: SeasonRepository,
        private series = new SeriesRepository(),
    ) {}

    /**
     * Finds a season by ID, validating that the parameter is a valid integer.
     */
    findOne(id: string): Promise<Season | undefined> {
        const seasonId = Number(id);
        if (!Number.isInteger(seasonId) || seasonId < 1) return Promise.resolve(undefined);
        return this.repo.findOne(seasonId);
    }

    /**
     * Returns all seasons registered in the platform.
     */
    async findAll(): Promise<Season[]> {
        return await this.repo.findAll();
    }

    /**
     * Retrieves all seasons belonging to a specific series.
     * Validates the series ID before querying.
     */
    async findBySerie(serieId: string): Promise<Season[]> {
        const id_Serie = Number(serieId);
        if (!Number.isInteger(id_Serie) || id_Serie < 1) return Promise.resolve([]);
        return await this.repo.findBySerie(id_Serie);
    }

    /**
     * Creates a new season linked to a parent series that the user uploaded.
     */
    async create(input: NewSeason, userId: number): Promise<OwnedResult<Season>> {
        const serie = await this.series.findOne(input.id_serie);
        return whenOwner(serie, userId, () => this.repo.create(new Season(
            input.id_serie,
            input.season_number,
            input.description ?? ""
        )));
    }

    /**
     * Updates an existing season with partial fields. Only the series' uploader can do it.
     */
    async update(id: string, input: SeasonChanges, userId: number): Promise<OwnedResult<Season>> {
        const season = await this.findOne(id);
        const serie = season && await this.series.findOne(season.id_serie);
        return whenOwner(serie, userId, () => this.repo.update(season!.id!, input));
    }

    /**
     * Deletes a season by ID. Only the series' uploader can do it.
     */
    async remove(id: string, userId: number): Promise<OwnedResult<true>> {
        const season = await this.findOne(id);
        const serie = season && await this.series.findOne(season.id_serie);
        return whenOwner(serie, userId, async () => (
            await this.repo.delete(season!.id!) ? true : undefined
        ));
    }
}
