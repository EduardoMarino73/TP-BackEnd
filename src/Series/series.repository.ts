import { Serie } from "./series.entity.js";
import { orm } from "../Shared/database/connections.js";
import { pickDefined, Repository } from "../Shared/repository.js";

/** Fields an uploader may edit: the author and the state are never changed through an edit. */
const EDITABLE_FIELDS = ["title", "description", "category"] as const;

/**
 * SeriesRepository implements the generic Repository contract for Serie entities.
 * It reads and writes through the ORM's EntityManager.
 */
export class SeriesRepository implements Repository<Serie> {
    /** The EntityManager of the current request (see RequestContext in index.ts). */
    private get em() {
        return orm.em;
    }

    /**
     * Retrieves all active series ordered by their ID.
     */
    async findAll(): Promise<Serie[]> {
        return this.em.find(Serie, { state: "active" }, { orderBy: { id: "asc" } });
    }

    /**
     * Retrieves a single active series by its unique ID, or undefined if no record matches.
     */
    async findOne(id: number): Promise<Serie | undefined> {
        return (await this.em.findOne(Serie, { id, state: "active" })) ?? undefined;
    }

    /** Returns series uploaded by one user, in any state. */
    async findByAuthor(authorId: number): Promise<Serie[]> {
        return this.em.find(Serie, { id_author: authorId });
    }

    /**
     * Inserts a new series. The ORM sets the generated ID on the entity.
     */
    async create(item: Serie): Promise<Serie> {
        await this.em.persist(item).flush();
        // a new series has no episodes yet: the cover shown is its own cover
        item.display_thumbnail_path = item.cover_path;
        return item;
    }

    /**
     * Updates only the editable fields supplied in input.
     */
    async update(id: number, input: Partial<Serie>): Promise<Serie | undefined> {
        const serie = await this.findOne(id);
        if (!serie) return undefined;
        this.em.assign(serie, pickDefined(input, EDITABLE_FIELDS));
        await this.em.flush();
        return serie;
    }

    /**
     * Logical delete: the series (and with it its seasons and episodes) is hidden, but the rows are kept.
     * Returns true if the series was active.
     */
    async delete(id: number): Promise<boolean> {
        const changed = await this.em.nativeUpdate(Serie, { id, state: "active" }, { state: "deleted" });
        return changed > 0;
    }
}
