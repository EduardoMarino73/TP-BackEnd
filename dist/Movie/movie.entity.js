//objeto que me va a representar a una pelicula durante la ejecucion
export class Movie {
    constructor(tittle, category, views, description, state, /*---> Maybe a enum is better in this case */ report, _id_Movie) {
        this.tittle = tittle;
        this.category = category;
        this.views = views;
        this.description = description;
        this.state = state;
        this.report = report;
        this._id_Movie = _id_Movie;
    }
}
//# sourceMappingURL=movie.entity.js.map