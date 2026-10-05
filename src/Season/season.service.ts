import { Season } from "./season.entity.js";
import { SeasonRepository } from "./season.repository.js";

/**
 * Service layer responsible for business rules and operations on Seasons.
 */
export class SeasonService {
    public constructor(private repo: SeasonRepository) {}

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
     * Creates a new season linked to a parent series.
     */
    async create(input: Omit<Season, "id">): Promise<Season> {
        const season = new Season(
            input.id_serie,
            input.season_number,
            input.description
        );
        return this.repo.create(season);
    }

    /**
     * Updates an existing season with partial fields.
     */
    update(id: string, input: Partial<Season>): Promise<Season | undefined> {
        const seasonId = Number(id);
        if (!Number.isInteger(seasonId) || seasonId < 1) return Promise.resolve(undefined);
        return this.repo.update(seasonId, input);
    }

    /**
     * Deletes a season by ID.
     */
    remove(id: string): Promise<boolean> {
        const seasonId = Number(id);
        if (!Number.isInteger(seasonId) || seasonId < 1) return Promise.resolve(false);
        return this.repo.delete(seasonId);
    }
}
