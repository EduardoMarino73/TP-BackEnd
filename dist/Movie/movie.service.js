import { ObjectId } from "mongodb";
import { Movie } from "./movie.entity.js";
/*Here is where Im going to do all the bussines logic, like create a new movie or find one movie of the dbb*/
export class MovieService {
    constructor(repo) {
        this.repo = repo;
    }
    findOne(id) {
        console.log("the service send the id to the repository");
        return this.repo.findOne({ id });
    }
    async finAll() {
        return await this.repo.findAll();
    }
    create(input) {
        const movie = new Movie(input.title, input.category, input.views, input.description, input.state);
        this.repo.create(movie);
        return movie;
    }
    update(id, input) {
        /*"...input" copy all the properties from input and make a new object, in this way I have a object with
        my id and all the properties like
        
        id,
        tittle,
        category,
        ... etc*/
        const id_Movie = new ObjectId(id);
        return this.repo.update(id_Movie, input);
    }
    remove(id) {
        return this.repo.delete({ id });
    }
}
//# sourceMappingURL=movie.service.js.map