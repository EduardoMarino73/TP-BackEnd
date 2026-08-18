import { Request, Response } from "express";
import { MovieRepository } from "./movie.repository.js";
import { MovieService } from "./movie.service.js";

const service = new MovieService(new MovieRepository());

/**tengo que acordarme de decirles a los chicos que no se puede enviar la informacion de la pelicula/episodio y el archivo al mismo tiempo
 * tendremos que implementar una forma de primero enviar los datos de la base de datos y luego pedir el archivo propiamente a la base de 
 * datos(estoy pensando en que se puede enviar el pathF dentro de req.params para eso) y ahi recien enviar el archivo 
 */

export const findAll = async (req:Request,res:Response) =>{
   res.json(await service.findAll());
}

export const findOne = async (req:Request,res:Response) =>{
    /*take the id param from the URL and send this to movie.service*/
    const id_Movie = req.params.id as string;
    const movie = await service.findOne(id_Movie);

    if(!movie){
        return res.sendStatus(404).send({message: "movie not found"});
    }
    return res.send({movie})

}

export const create = async (req:Request,res:Response) =>{
    const movieInput = req.body.sanitizeMovieInput;
    const requiredFields = ["id_author","pathF","tittle", "category", "views", "description", "state"] as const;
    const missingFields = requiredFields.filter((field) => movieInput[field] === undefined);

    if (missingFields.length > 0) {
        return res.status(400).json({
            message: "Missing required movie fields",
            fields: missingFields,
        });
    }

    const movie = await service.create(movieInput);
    return res.status(201).json({message: "movie created", data:movie});
}

export const update = async (req:Request,res:Response) =>{
    const id_Movie = req.params.id as string;
    /* "req.body.sanitizeMovieInput" is a callback that clear all the undefined params of my movie object */
    const movie = await service.update(id_Movie,req.body.sanitizeMovieInput);

    if(!movie){
        return res.sendStatus(404);
    }
    return res.status(200).send({message: "movie updated",data:movie});
}

export const remove = async (req:Request,res:Response) => {
    const id_Movie = req.params.id as string;
    const result = await service.remove(id_Movie);

    if(!result){
        return res.sendStatus(500).send({message: "internal error"});
    }
    return res.status(200).send({message: `movie with id: ${id_Movie} was removed`});
}