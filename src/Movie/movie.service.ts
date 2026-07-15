import { ObjectId } from "mongodb";
import { Repository } from "../Shared/repository.js";
import { Movie } from "./movie.entity.js";

/*Here is where Im going to do all the bussines logic, like create a new movie or find one movie of the dbb*/

export class MovieService {
    public constructor(private repo:Repository<Movie>){}

    findOne(id:string): Promise<Movie | undefined>{
        return this.repo.findOne({id})
    }

    finAll(): Promise<Movie[] | undefined>{
        return this.repo.findAll();
    }

    create(input:Omit<Movie, "report"|"id">): Movie{
        const movie = new Movie(
            input.tittle,
            input.category,
            input.views,
            input.description,
            input.state,
        );
        return movie;
    }

    update(id:string, input: Partial<Movie>): Promise<Movie | undefined> {
        /*"...input" copy all the properties from input and make a new object, in this way I have a object with 
        my id and all the properties like
        
        id,
        tittle,
        category,
        ... etc*/
        return this.repo.update({id, ...input} as Movie);
    }

   
    remove(id: string): Promise<{_id:ObjectId} | undefined> {
        return this.repo.delete({id});
    }
}