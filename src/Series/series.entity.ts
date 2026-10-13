import { Entity, Formula, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { User } from "../User_Folder/user.entity.js";
import { uploaderUserName } from "../Audiovisual/audiovisual.entity.js";

/** SQL for the cover shown to users: the series' own cover or its first active episode's thumbnail. */
const coverOrFirstThumbnail = ({ alias }: { alias: string }) => `COALESCE(${alias}.thumbnail_path, (
    SELECT e.thumbnail_path
    FROM seasons AS se
    JOIN episodes AS e ON e.id_season = se.id
    WHERE se.id_serie = ${alias}.id AND se.state = 'active' AND e.state = 'active'
      AND e.thumbnail_path IS NOT NULL
    ORDER BY se.season_number, e.episode_number
    LIMIT 1
))`;

/**
 * Entity that represents a TV Show / Serie, mapped to the series table.
 * It encapsulates the basic properties of a series and its author.
 */
@Entity({ tableName: "series" })
export class Serie {
    // Primary key assigned by the database (auto-incremented)
    @PrimaryKey()
    id?: number;

    // The user who uploaded this series, kept as its id
    @ManyToOne(() => User, { fieldName: "id_author", mapToPk: true })
    id_author: number;

    @Property()
    title: string;

    // Category or genre (e.g. Action, Drama, Sci-Fi)
    @Property({ type: "string", length: 100, nullable: true })
    category: string;

    // Detailed synopsis or description of the series
    @Property({ type: "text", nullable: true })
    description: string;

    // Current status ('active', 'suspended' or 'deleted')
    @Property()
    state: string;

    /** The series' own cover ("/thumbnails/..."), stored in thumbnail_path. Not sent: see below. */
    @Property({ fieldName: "thumbnail_path", type: "string", nullable: true, hidden: true })
    cover_path: string | null = null;

    /**
     * URL path of the cover, sent as thumbnail_path. When the series has no cover of its own,
     * it is the thumbnail of its first episode; null when there is neither.
     */
    @Formula(coverOrFirstThumbnail, { type: "string", nullable: true, serializedName: "thumbnail_path" })
    display_thumbnail_path: string | null = null;

    /** Username of the uploader, read with the series. */
    @Formula(uploaderUserName, { type: "string", nullable: true })
    uploader_user_name?: string;

    constructor(
        id_author: number,
        title: string,
        category: string,
        description: string,
        state = "active",
    ) {
        this.id_author = id_author;
        this.title = title;
        this.category = category;
        this.description = description;
        this.state = state;
    }
}
