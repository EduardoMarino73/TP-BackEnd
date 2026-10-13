import { Entity, Enum, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Viewer } from "../User_Folder/viewer/viewer.entity.js";

/** Audiovisual types supported by the project's current content tables. */
export type AudiovisualType = "movie" | "episode";

/** Represents a viewer's rating of a movie or episode, mapped to the reviews table. */
@Entity({ tableName: "reviews" })
export class Review {
    @PrimaryKey()
    id?: number;

    /** The viewer who rated, kept as its id (reviews.viewer_id). */
    @ManyToOne(() => Viewer, { fieldName: "viewer_id", mapToPk: true })
    viewerId: number;

    /** true represents a positive rating; false represents a negative one. */
    @Property()
    rating: boolean;

    @Property({ type: "integer" })
    audiovisualId: number;

    @Enum({ items: ["movie", "episode"] })
    audiovisualType: AudiovisualType;

    constructor(viewerId: number, rating: boolean, audiovisualId: number, audiovisualType: AudiovisualType) {
        this.viewerId = viewerId;
        this.rating = rating;
        this.audiovisualId = audiovisualId;
        this.audiovisualType = audiovisualType;
    }
}
