import { Serie } from "./series.entity.js";
import { Repository } from "../Shared/repository.js";

/**
 * Service layer responsible for business logic regarding Series.
 * It sits between the Controller (HTTP handling) and the Repository (Database access).
 */
export class SeriesService {
    // Injects the generic repository interface to ensure loose coupling
    public constructor(private repo: Repository<Serie>) {}

    /**
     * Finds a series by its string ID from URL parameters.
     * Validates that the ID is a valid positive integer before querying the repository.
     */
    findOne(id: string): Promise<Serie | undefined> {
        const serieId = Number(id);
        if (!Number.isInteger(serieId) || serieId < 1) {
            return Promise.resolve(undefined);
        }
        return this.repo.findOne(serieId);
    }

    /**
     * Retrieves the entire list of series.
     */
    async findAll(): Promise<Serie[]> {
        return await this.repo.findAll();
    }

    /**
     * Creates a new series entity and persists it via the repository.
     */
    async create(input: Omit<Serie, "id">): Promise<Serie> {
        const serie = new Serie(
            input.id_author,
            input.title,
            input.category,
            input.description,
            input.state
        );
        return this.repo.create(serie);
    }

    /**
     * Updates an existing series with partial data.
     */
    update(id: string, input: Partial<Serie>): Promise<Serie | undefined> {
        const serieId = Number(id);
        if (!Number.isInteger(serieId) || serieId < 1) {
            return Promise.resolve(undefined);
        }
        return this.repo.update(serieId, input);
    }

    /**
     * Removes a series by ID.
     */
    remove(id: string): Promise<boolean> {
        const serieId = Number(id);
        if (!Number.isInteger(serieId) || serieId < 1) {
            return Promise.resolve(false);
        }
        return this.repo.delete(serieId);
    }
}
