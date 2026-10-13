import { Movie } from "./movie.entity.js";
import { Repository } from "../Shared/repository.js";
import { getMoviePath } from "../Shared/database/content.Storage.js";
import { OwnedResult, whenOwner } from "../Shared/ownership.js";
import path from "path";

/** Fields a viewer sends to upload a movie; the author comes from the token. */
export type NewMovie = {
    id_author: number;
    path: string;
    title: string;
    category: string;
    description?: string;
    thumbnail_path?: string | null;
    duration?: number | null;
};

/** Fields the uploader may change later. */
export type MovieChanges = Partial<Pick<Movie, "title" | "category" | "description">>;

/*Here is where Im going to do all the bussines logic, like create a new movie or find one movie of the dbb*/

export class MovieService {
    public constructor(private repo: Repository<Movie>){}

    async findAll(): Promise<Movie[]> {
        return await this.repo.findAll();
    }

    findOne(id:string): Promise<Movie | undefined>{
        const movieId = Number(id);
        if (!Number.isInteger(movieId) || movieId < 1) return Promise.resolve(undefined);
        return this.repo.findOne(movieId);
    }

    async findOneByPath(moviePath:string): Promise<string> {
        return path.resolve(getMoviePath(moviePath));
    }

    /** New movies always start active and with no views. */
    async create(input: NewMovie): Promise<Movie>{

        const movie = new Movie(
            input.id_author,
            input.path,
            input.title,
            input.category,
            0,
            input.description ?? "",
            "active",
        );
        movie.thumbnail_path = input.thumbnail_path ?? null;
        movie.duration = input.duration ?? null;

        return this.repo.create(movie);
    }

    /** Only the uploader can edit a movie. */
    async update(id:string, input: MovieChanges, userId: number): Promise<OwnedResult<Movie>> {
        const movie = await this.findOne(id);
        return whenOwner(movie, userId, (found) => this.repo.update(found.id!, input));
    }

    /** Only the uploader can delete a movie. */
    async remove(id: string, userId: number): Promise<OwnedResult<true>> {
        const movie = await this.findOne(id);
        return whenOwner(movie, userId, async (found) => (
            await this.repo.delete(found.id!) ? true : undefined
        ));
    }
}
