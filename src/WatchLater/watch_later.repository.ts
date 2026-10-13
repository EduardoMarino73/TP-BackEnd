import { orm } from "../Shared/database/connections.js";
import { Movie } from "../Movie/movie.entity.js";
import { Serie } from "../Series/series.entity.js";
import { WatchLater, WatchLaterItem } from "./watch_later.entity.js";

/** Database access for the "Watch later" lists, through the ORM. */
export class WatchLaterRepository {
    /** The EntityManager of the current request (see RequestContext in index.ts). */
    private get em() {
        return orm.em;
    }

    /**
     * The viewer's list, newest first, with the movie or series of each item.
     * Content that is no longer active (suspended or deleted) is left out.
     */
    async findByViewer(viewerId: number): Promise<WatchLaterItem[]> {
        const items = await this.em.find(WatchLater, { viewerId }, { orderBy: { addedAt: "desc", id: "desc" } });
        const idsOf = (type: WatchLater["audiovisualType"]) => items
            .filter((item) => item.audiovisualType === type)
            .map((item) => item.audiovisualId);

        const movies = await this.em.find(Movie, { id: { $in: idsOf("movie") }, state: "active" });
        const series = await this.em.find(Serie, { id: { $in: idsOf("series") }, state: "active" });
        const movieById = new Map(movies.map((movie) => [movie.id, movie]));
        const serieById = new Map(series.map((serie) => [serie.id, serie]));

        return items.flatMap((item): WatchLaterItem[] => {
            const base = {
                id: item.id,
                viewerId: item.viewerId,
                audiovisualId: item.audiovisualId,
                audiovisualType: item.audiovisualType,
                addedAt: item.addedAt,
            };
            if (item.audiovisualType === "movie") {
                const movie = movieById.get(item.audiovisualId);
                return movie ? [{
                    ...base,
                    title: movie.title,
                    category: movie.category ?? "",
                    description: movie.description ?? "",
                    thumbnail_path: movie.thumbnail_path ?? null,
                    duration: movie.duration ?? null,
                }] : [];
            }
            const serie = serieById.get(item.audiovisualId);
            return serie ? [{
                ...base,
                title: serie.title,
                category: serie.category ?? "",
                description: serie.description ?? "",
                thumbnail_path: serie.display_thumbnail_path ?? null,
                duration: null,
            }] : [];
        });
    }

    async findOne(id: number): Promise<WatchLater | undefined> {
        return (await this.em.findOne(WatchLater, id)) ?? undefined;
    }

    /** Fails with ER_DUP_ENTRY when the viewer already saved that content. */
    async create(item: WatchLater): Promise<WatchLater> {
        await this.em.persist(item).flush();
        return item;
    }

    async delete(id: number): Promise<boolean> {
        return (await this.em.nativeDelete(WatchLater, { id })) > 0;
    }
}
