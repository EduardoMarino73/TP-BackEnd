import { Entity, Formula, ManyToOne, OnLoad, PrimaryKey, Property } from "@mikro-orm/core";
import { User } from "../User_Folder/user.entity.js";

/** SQL that reads the uploader's username, for content tables that have an id_author column. */
export const uploaderUserName = ({ alias }: { alias: string }) =>
    `(SELECT u.user_name FROM users AS u WHERE u.id_user = ${alias}.id_author)`;

/**
 * Shared properties for audiovisual content in the platform.
 * Movies and episodes specialize this base entity with their own fields.
 * It is abstract: it has no table, each subclass maps its own (movies, episodes).
 */
@Entity({ abstract: true })
export abstract class Audiovisual {
    @PrimaryKey()
    id?: number;

    @Property()
    title: string;

    /** Mapped by Movie; episodes have no category column (see Episode). */
    category: string;

    @Property({ type: "integer" })
    views: number;

    @Property({ type: "text", nullable: true })
    description: string;

    /** The uploader. Kept as its id (mapToPk), the relation is still known by the ORM. */
    @ManyToOne(() => User, { fieldName: "id_author", mapToPk: true })
    id_author: number;

    @Property()
    state: string;

    /** URL path of the thumbnail image ("/thumbnails/..."), or null when there is none. */
    @Property({ type: "string", nullable: true })
    thumbnail_path: string | null = null;

    /** Length of the video in seconds, read by the frontend from the file; null for old content. */
    @Property({ type: "integer", nullable: true })
    duration: number | null = null;

    /** Username of the uploader, read with the content (it is not a column of the table). */
    @Formula(uploaderUserName, { type: "string", nullable: true })
    uploader_user_name?: string;

    /** Not stored. */
    @Property({ persist: false, type: "integer" })
    reportsCount = 0;

    protected constructor(
        title: string,
        category: string,
        views: number,
        description: string,
        id_author: number,
        state: string,
    ) {
        this.title = title;
        this.category = category;
        this.views = views;
        this.description = description;
        this.id_author = id_author;
        this.state = state;
    }

    /** The ORM does not run the constructor when it loads a row, so it sets the defaults here. */
    @OnLoad()
    protected setDefaults(): void {
        this.reportsCount = 0;
    }

    /** Alias used by the domain model diagram for the uploading user. */
    get uploadedId(): number {
        return this.id_author;
    }

    /** Active status represented by the existing database state column. */
    get active(): boolean {
        return this.state === "active";
    }
}
