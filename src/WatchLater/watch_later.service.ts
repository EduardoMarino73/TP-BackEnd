import { MovieRepository } from "../Movie/movie.repository.js";
import { SeriesRepository } from "../Series/series.repository.js";
import { OwnedResult, whenOwner } from "../Shared/ownership.js";
import { WatchLater, WatchLaterItem, WatchLaterType } from "./watch_later.entity.js";
import { WatchLaterRepository } from "./watch_later.repository.js";

/** Rules of the "Watch later" list: each viewer only sees and changes their own list. */
export class WatchLaterService {
    constructor(
        private readonly repository = new WatchLaterRepository(),
        private readonly movies = new MovieRepository(),
        private readonly series = new SeriesRepository(),
    ) {}

    list(viewerId: number): Promise<WatchLaterItem[]> {
        return this.repository.findByViewer(viewerId);
    }

    /** Saves an active movie or series. Returns undefined when that content does not exist. */
    async add(viewerId: number, audiovisualId: number, audiovisualType: WatchLaterType): Promise<WatchLater | undefined> {
        const content = audiovisualType === "movie"
            ? await this.movies.findOne(audiovisualId)
            : await this.series.findOne(audiovisualId);
        if (!content) return undefined;
        return this.repository.create(new WatchLater(viewerId, audiovisualId, audiovisualType));
    }

    /** Removes an item. Only the viewer who saved it can do it. */
    async remove(id: number, viewerId: number): Promise<OwnedResult<true>> {
        const item = Number.isSafeInteger(id) && id > 0 ? await this.repository.findOne(id) : undefined;
        return whenOwner(item, viewerId, async (found) => (
            await this.repository.delete(found.id!) ? true : undefined
        ), (found) => found.viewerId);
    }
}
