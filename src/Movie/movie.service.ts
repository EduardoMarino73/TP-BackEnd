import { Movie } from "./movie.entity.js";
import { Repository } from "../Shared/repository.js";

/*Here is where Im going to do all the bussines logic, like create a new movie or find one movie of the dbb*/

export class MovieService {
    public constructor(private repo: Repository<Movie>){}

    findOne(id:string): Promise<Movie | undefined>{
        console.log("the service send the id to the repository");
        const movieId = Number(id);
        if (!Number.isInteger(movieId) || movieId < 1) return Promise.resolve(undefined);
        return this.repo.findOne(movieId);
    }

    async findAll(): Promise<Movie[]> {
        return await this.repo.findAll();
    }

    async create(input:Omit<Movie, "report"|"id">): Promise<Movie>{


        const movie = new Movie(
            input.id_author,
            input.path,
            input.title,
            input.category,
            input.views,
            input.description,
            input.state,
        );

        return this.repo.create(movie);
    }

    update(id:string, input: Partial<Movie>): Promise<Movie | undefined> {
        /*"...input" copy all the properties from input and make a new object, in this way I have a object with 
        my id and all the properties like
        
        id,
        title,
        category,
        ... etc*/

        const id_Movie = Number(id);
        if (!Number.isInteger(id_Movie) || id_Movie < 1) return Promise.resolve(undefined);
        return this.repo.update(id_Movie,input);
    }

   
    remove(id: string): Promise<boolean> {
        const movieId = Number(id);
        if (!Number.isInteger(movieId) || movieId < 1) return Promise.resolve(false);
        return this.repo.delete(movieId);
    }
}
