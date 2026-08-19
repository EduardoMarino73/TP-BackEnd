import { MovieRepository } from "./movie.repository.js";
import { MovieService } from "./movie.service.js";
/*El controlador se va a encargar de manejar la logica del negocio que me permite armar un paquete
con toda la informacion que voy a tener que devolver al FrontEnd */
const service = new MovieService(new MovieRepository());
export const findAll = async (req, res) => {
    res.json(await service.findAll());
};
export const findOne = async (req, res) => {
    /*take the id param from the URL and send this to movie.service*/
    const id_Movie = req.params.id;
    const movie = await service.findOne(id_Movie);
    if (!movie) {
        return res.sendStatus(404).send({ message: "movie not found" });
    }
    return res.send({ movie });
};
export const create = async (req, res) => {
    const movieInput = req.body.sanitizeMovieInput;
    const requiredFields = ["id_author", "path", "title", "views", "description", "state"];
    const missingFields = requiredFields.filter((field) => movieInput[field] === undefined);
    if (missingFields.length > 0) {
        return res.status(400).json({
            message: "Missing required movie fields",
            fields: missingFields,
        });
    }
    const movie = await service.create(movieInput);
    return res.status(201).json({ message: "movie created", data: movie });
};
export const update = async (req, res) => {
    const id_Movie = req.params.id;
    /* "req.body.sanitizeMovieInput" is a callback that clear all the undefined params of my movie object */
    const movie = await service.update(id_Movie, req.body.sanitizeMovieInput);
    if (!movie) {
        return res.sendStatus(404);
    }
    return res.status(200).send({ message: "movie updated", data: movie });
};
export const remove = async (req, res) => {
    const id_Movie = req.params.id;
    const result = await service.remove(id_Movie);
    if (!result) {
        return res.sendStatus(500).send({ message: "internal error" });
    }
    return res.status(200).send({ message: `movie with id: ${id_Movie} was removed` });
};
//# sourceMappingURL=movie.controller.js.map