/**
 * Shared properties for audiovisual content in the platform.
 * Movies and episodes specialize this base entity with their own fields.
 */
export abstract class Audiovisual {
    public reportsCount = 0;

    protected constructor(
        public title: string,
        public category: string,
        public views: number,
        public description: string,
        public id_author: number,
        public state: string,
        public id?: number,
    ) {}

    /** Alias used by the domain model diagram for the uploading user. */
    get uploadedId(): number {
        return this.id_author;
    }

    /** Active status represented by the existing database state column. */
    get active(): boolean {
        return this.state === "active";
    }
}
