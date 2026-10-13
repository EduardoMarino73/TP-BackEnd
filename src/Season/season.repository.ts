import { pickDefined, Repository } from "../Shared/repository.js";
import { Season } from "./season.entity.js";
import { orm } from "../Shared/database/connections.js";

/** A season cannot be moved to another series through an edit. */
const EDITABLE_FIELDS = ["season_number", "description"] as const;

/**
 * SeasonRepository provides data access methods for Season entities through the ORM.
 */
export class SeasonRepository implements Repository<Season> {
    /** The EntityManager of the current request (see RequestContext in index.ts). */
    private get em() {
        return orm.em;
    }

    /**
     * Retrieves all active seasons ordered by season number.
     */
    async findAll(): Promise<Season[]> {
        return this.em.find(Season, { state: "active" }, { orderBy: { season_number: "asc" } });
    }

    /**
     * Finds a single active season by its primary key ID.
     */
    async findOne(id: number): Promise<Season | undefined> {
        return (await this.em.findOne(Season, { id, state: "active" })) ?? undefined;
    }

    /**
     * Retrieves all active seasons belonging to a specific series.
     * Ordered ascending by season_number so the frontend displays them chronologically.
     */
    async findBySerie(id_serie: number): Promise<Season[]> {
        return this.em.find(Season, { id_serie, state: "active" }, { orderBy: { season_number: "asc" } });
    }

    /**
     * Inserts a new season linked to a parent series.
     * Fails with ER_DUP_ENTRY when the series already has an active season with that number.
     */
    async create(item: Season): Promise<Season> {
        await this.em.persist(item).flush();
        return item;
    }

    /**
     * Updates only the editable fields supplied in input.
     */
    async update(id: number, input: Partial<Season>): Promise<Season | undefined> {
        const season = await this.findOne(id);
        if (!season) return undefined;
        this.em.assign(season, pickDefined(input, EDITABLE_FIELDS));
        await this.em.flush();
        return season;
    }

    /**
     * Logical delete of a season. Its episodes are hidden too, because every episode
     * query only returns episodes whose season is active.
     */
    async delete(id: number): Promise<boolean> {
        const changed = await this.em.nativeUpdate(Season, { id, state: "active" }, { state: "deleted" });
        return changed > 0;
    }
}
