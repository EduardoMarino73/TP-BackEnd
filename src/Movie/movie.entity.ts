import { Entity, Property } from "@mikro-orm/core";
import { Audiovisual } from "../Audiovisual/audiovisual.entity.js";

/** A movie, mapped to the movies table. */
@Entity({ tableName: "movies" })
export class Movie extends Audiovisual {
    /** URL path of the video file ("/movies/..."). */
    @Property()
    path: string;

    @Property({ type: "string", length: 100, nullable: true })
    category!: string;

    constructor(
        id_author: number,
        path: string,
        title: string,
        category: string,
        views: number,
        description: string,
        state: string,
    ) {
        super(title, category, views, description, id_author, state);
        this.path = path;
    }
}
