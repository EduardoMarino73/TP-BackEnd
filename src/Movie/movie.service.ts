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

    create(){
        
    }

    update(id:string, input: Partial<Movie>): Movie | undefined {
        return this.repo.update({id, ...input} as Movie);
    }
    
    /*REMEMBER YOU MUST FIX THIS METHOD, DONT FORGIVE IT */
    remove(id: string): String | undefined {
        return this.repo.delete({id});
    }
}