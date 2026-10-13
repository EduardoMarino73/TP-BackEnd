import { Serie } from "./series.entity.js";
import { Repository } from "../Shared/repository.js";
import { OwnedResult, whenOwner } from "../Shared/ownership.js";

/** Fields of a new series; the author comes from the token. */
export type NewSerie = Pick<Serie, "id_author" | "title" | "category"> & {
    description?: string;
    thumbnail_path?: string | null;
};

/** Fields the uploader may change later. */
export type SerieChanges = Partial<Pick<Serie, "title" | "category" | "description">>;

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
     * New series always start active.
     */
    async create(input: NewSerie): Promise<Serie> {
        const serie = new Serie(
            input.id_author,
            input.title,
            input.category,
            input.description ?? "",
            "active"
        );
        serie.cover_path = input.thumbnail_path ?? null;
        return this.repo.create(serie);
    }

    /**
     * Updates an existing series with partial data. Only its uploader can do it.
     */
    async update(id: string, input: SerieChanges, userId: number): Promise<OwnedResult<Serie>> {
        const serie = await this.findOne(id);
        return whenOwner(serie, userId, (found) => this.repo.update(found.id!, input));
    }

    /**
     * Removes a series by ID. Only its uploader can do it.
     */
    async remove(id: string, userId: number): Promise<OwnedResult<true>> {
        const serie = await this.findOne(id);
        return whenOwner(serie, userId, async (found) => (
            await this.repo.delete(found.id!) ? true : undefined
        ));
    }
}
