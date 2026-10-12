/** Content that can be saved for later: a movie or a whole series. */
export type WatchLaterType = "movie" | "series";

/** One item of a viewer's "Watch later" list. */
export class WatchLater {
    constructor(
        public viewerId: number,
        public audiovisualId: number,
        public audiovisualType: WatchLaterType,
        public id?: number,
        public addedAt?: Date,
    ) {}
}

/** An item of the list together with the content it points to, as the list page shows it. */
export type WatchLaterItem = WatchLater & {
    title: string;
    category: string;
    description: string;
};
