import { Repository } from "../Shared/repository.js";
import { Movie } from "./movie.entity.js";

/*Here is where Im going to do all the bussines logic, like create a new movie or find one movie of the dbb*/

export class MovieService {
    public constructor(private repo:Repository<Movie>){}

    findOne(id:string): Movie | undefined{
        return this.repo.findOne({id})
    }

    finAll(): Movie[] | undefined{
        return this.repo.findAll()
    }

    create(input:Omit<Movie, "report"|"id">): Movie{
        const movie = new Movie(
            input.tittle,
            input.category,
            input.views,
            input.description,
            input.state,
        );
        return movie
    }

    update(id:string, input: Partial<Movie>): Movie | undefined {
        return this.repo.update({id, ...input} as Movie);
    }

   
    remove(id: string): String | undefined {
        return this.repo.delete({id});
    }
}