import { Movie } from "./movie.entity.js";
import { orm } from "../Shared/database/connections.js";
import { pickDefined, Repository } from "../Shared/repository.js";

/** Fields an uploader may edit: state, views, path and the author are never changed here. */
const EDITABLE_FIELDS = ["title", "category", "description"] as const;

/** Database access for movies, through the ORM's EntityManager. */
export class MovieRepository implements Repository<Movie> {
    /** The EntityManager of the current request (see RequestContext in index.ts). */
    private get em() {
        return orm.em;
    }

    async findAll(): Promise<Movie[]> {
        return this.em.find(Movie, { state: "active" }, { orderBy: { id: "asc" } });
    }

    async findOne(id: number): Promise<Movie | undefined> {
        return (await this.em.findOne(Movie, { id, state: "active" })) ?? undefined;
    }

    /** Returns movies uploaded by one user. */
    async findByAuthor(authorId: number): Promise<Movie[]> {
        return this.em.find(Movie, { id_author: authorId, state: { $ne: "deleted" } }, { orderBy: { id: "asc" } });
    }

    async create(item: Movie): Promise<Movie> {
        await this.em.persist(item).flush();
        return item;
    }

    async update(id: number, input: Partial<Movie>): Promise<Movie | undefined> {
        const movie = await this.findOne(id);
        if (!movie) return undefined;
        this.em.assign(movie, pickDefined(input, EDITABLE_FIELDS));
        await this.em.flush();
        return movie;
    }

    /** Logical delete: the movie is hidden everywhere, but its row and file are kept. */
    async delete(id: number): Promise<boolean> {
        const changed = await this.em.nativeUpdate(Movie, { id, state: "active" }, { state: "deleted" });
        return changed > 0;
    }
}
