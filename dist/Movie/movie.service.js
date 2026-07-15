import { Movie } from "./movie.entity.js";
/*Here is where Im going to do all the bussines logic, like create a new movie or find one movie of the dbb*/
export class MovieService {
    constructor(repo) {
        this.repo = repo;
    }
    findOne(id) {
        return this.repo.findOne({ id });
    }
    finAll() {
        return this.repo.findAll();
    }
    create(input) {
        const movie = new Movie(input.tittle, input.category, input.views, input.description, input.state);
        return movie;
    }
    update(id, input) {
        /*"...input" copy all the properties from input and make a new object, in this way I have a object with
        my id and all the properties like
        
        id,
        tittle,
        category,
        ... etc*/
        return this.repo.update({ id, ...input });
    }
    remove(id) {
        return this.repo.delete({ id });
    }
}
//# sourceMappingURL=movie.service.js.map