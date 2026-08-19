import { Request, Response } from "express";
import { MovieRepository } from "./movie.repository.js";
import { MovieService } from "./movie.service.js";
import { movieTitle } from "../Shared/database/content.Storage.js";

/*El controlador se va a encargar de manejar la logica del negocio que me permite armar un paquete
con toda la informacion que voy a tener que devolver al FrontEnd */

const service = new MovieService(new MovieRepository());

export const findAll = async (req:Request,res:Response) =>{
   res.json(await service.findAll());
}

export const findOne = async (req:Request,res:Response) =>{
    /*take the id param from the URL and send this to movie.service*/
    const id_Movie = req.params.id as string;
    const movie = await service.findOne(id_Movie);

    if(!movie){
        return res.sendStatus(404);
    }
    return res.send({movie});
}

export const findOneByPath = async (req:Request,res:Response) => {

    if(req.body.sanitizeMoviePathInput.path === undefined){
        res.send({message:"the path is undefined"})
    }

    const filePath = await service.findOneByPath(req.body.sanitizeMoviePathInput.path as string)
    return res.sendFile(filePath);
}

export const create = async (req:Request,res:Response) =>{
    /** log check if anything is wrong */
    const movieInput = req.body.sanitizeMovieInput;

    if (req.file) {
        movieInput.path = movieTitle(req,req.file.originalname);
    }

    const requiredFields = ["id_author", "title", "views", "description", "state"] as const;
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
