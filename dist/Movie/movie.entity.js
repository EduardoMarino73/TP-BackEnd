//objeto que me va a representar a una pelicula durante la ejecucion
export class Movie {
    constructor(id_author, path, title, category, views, description, state, /*---> Maybe a enum is better in this case */ report, id) {
        this.id_author = id_author;
        this.path = path;
        this.title = title;
        this.category = category;
        this.views = views;
        this.description = description;
        this.state = state;
        this.report = report;
        this.id = id;
    }
}
//# sourceMappingURL=movie.entity.js.map