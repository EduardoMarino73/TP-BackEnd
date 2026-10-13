import { FilterQuery } from "@mikro-orm/core";
import { pickDefined, Repository } from "../Shared/repository.js";
import { Episode } from "./episode.entity.js";
import { orm } from "../Shared/database/connections.js";

/** Only the fields an uploader may edit: the season, file, views, state and author never change here. */
const EDITABLE_FIELDS = ["episode_number", "title", "description"] as const;

/**
 * Condition of a visible episode: it, its season and its series are active.
 * The ORM turns the nested conditions into joins through the relations. The cast is needed
 * because id_season is typed as a number (mapToPk), although for the ORM it is a relation.
 */
export function visibleEpisode(
    filter: { id?: number; path?: string; id_season?: number } = {},
): FilterQuery<Episode> {
    const { id_season, ...episode } = filter;
    return {
        ...episode,
        state: "active",
        id_season: {
            ...(id_season === undefined ? {} : { id: id_season }),
            state: "active",
            id_serie: { state: "active" },
        },
    } as FilterQuery<Episode>;
}

/**
 * EpisodeRepository implements data access logic for Episode entities through the ORM.
 */
export class EpisodeRepository implements Repository<Episode> {
    /** The EntityManager of the current request (see RequestContext in index.ts). */
    private get em() {
        return orm.em;
    }

    /**
     * Retrieves all visible episodes ordered by season and episode number.
     */
    async findAll(): Promise<Episode[]> {
        return this.em.find(Episode, visibleEpisode(), { orderBy: { id_season: "asc", episode_number: "asc" } });
    }

    /**
     * Finds a single visible episode by its primary key ID.
     */
    async findOne(id: number): Promise<Episode | undefined> {
        return (await this.em.findOne(Episode, visibleEpisode({ id }))) ?? undefined;
    }

    /**
     * Retrieves all visible episodes belonging to a specific season, ordered by episode_number.
     */
    async findBySeason(id_season: number): Promise<Episode[]> {
        return this.em.find(Episode, visibleEpisode({ id_season }), { orderBy: { episode_number: "asc" } });
    }

    /** Returns episodes uploaded by one user. */
    async findByAuthor(authorId: number): Promise<Episode[]> {
        return this.em.find(
            Episode,
            { id_author: authorId, state: { $ne: "deleted" } },
            { orderBy: { id_season: "asc", episode_number: "asc" } },
        );
    }

    /**
     * Inserts a new episode.
     * Fails with ER_DUP_ENTRY when the season already has an active episode with that number.
     */
    async create(item: Episode): Promise<Episode> {
        await this.em.persist(item).flush();
        return item;
    }

    /**
     * Updates only the editable fields supplied in input.
     */
    async update(id: number, input: Partial<Episode>): Promise<Episode | undefined> {
        const episode = await this.findOne(id);
        if (!episode) return undefined;
        this.em.assign(episode, pickDefined(input, EDITABLE_FIELDS));
        await this.em.flush();
        return episode;
    }

    /**
     * Logical delete: the episode is hidden everywhere, but its row and file are kept.
     */
    async delete(id: number): Promise<boolean> {
        const changed = await this.em.nativeUpdate(Episode, { id, state: "active" }, { state: "deleted" });
        return changed > 0;
    }
}
