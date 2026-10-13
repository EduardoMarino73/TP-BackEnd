import { Entity, ManyToOne, OnLoad, Property } from "@mikro-orm/core";
import { Audiovisual } from "../Audiovisual/audiovisual.entity.js";
import { Season } from "../Season/season.entity.js";

/**
 * Entity that represents an Episode belonging to a Season, mapped to the episodes table.
 * Encapsulates the video file path, author, views, and episode sequencing.
 */
@Entity({ tableName: "episodes" })
export class Episode extends Audiovisual {
    // The parent season, kept as its id (episodes.id_season)
    @ManyToOne(() => Season, { fieldName: "id_season", mapToPk: true })
    id_season: number;

    // Sequential episode number within the season (e.g. 1, 2, 3...)
    @Property({ type: "integer" })
    episode_number: number;

    // Relative file path on the server where the video file is saved (e.g. '/series/1723...mp4')
    @Property()
    path: string;

    // Episodes have no category column: it is always empty
    @Property({ persist: false, type: "string" })
    category!: string;

    constructor(
        id_season: number,
        episode_number: number,
        title: string,
        description: string,
        path: string,
        id_author: number,
        views = 0,
        state = "active",
    ) {
        super(title, "", views, description, id_author, state);
        this.id_season = id_season;
        this.episode_number = episode_number;
        this.path = path;
    }

    @OnLoad()
    protected setEmptyCategory(): void {
        this.category = "";
    }
}
