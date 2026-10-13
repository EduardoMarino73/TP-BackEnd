import { Entity, Enum, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Viewer } from "../User_Folder/viewer/viewer.entity.js";

/** Content that can be saved for later: a movie or a whole series. */
export type WatchLaterType = "movie" | "series";

/** One item of a viewer's "Watch later" list, mapped to the watch_later table. */
@Entity({ tableName: "watch_later" })
export class WatchLater {
    @PrimaryKey()
    id?: number;

    /** The viewer who saved the item, kept as its id (watch_later.viewer_id). */
    @ManyToOne(() => Viewer, { fieldName: "viewer_id", mapToPk: true })
    viewerId: number;

    @Property({ type: "integer" })
    audiovisualId: number;

    @Enum({ items: ["movie", "series"] })
    audiovisualType: WatchLaterType;

    @Property({ fieldName: "created_at" })
    addedAt: Date = new Date();

    constructor(viewerId: number, audiovisualId: number, audiovisualType: WatchLaterType) {
        this.viewerId = viewerId;
        this.audiovisualId = audiovisualId;
        this.audiovisualType = audiovisualType;
    }
}

/** An item of the list together with the content it points to, as the list page shows it. */
export type WatchLaterItem = Pick<WatchLater, "id" | "viewerId" | "audiovisualId" | "audiovisualType" | "addedAt"> & {
    title: string;
    category: string;
    description: string;
    // movie thumbnail, or series cover (falling back to its first episode's thumbnail)
    thumbnail_path: string | null;
    // movie length in seconds; null for series and old movies
    duration: number | null;
};
