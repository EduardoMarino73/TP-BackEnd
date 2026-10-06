/** Audiovisual types supported by the project's current content tables. */
export type AudiovisualType = "movie" | "episode";

/** Represents a viewer's rating of a movie or episode. */
export class Review {
    constructor(
        public viewerId: number,
        /** true represents a positive rating; false represents a negative one. */
        public rating: boolean,
        public audiovisualId: number,
        public audiovisualType: AudiovisualType,
        public id?: number,
    ) {}
}
