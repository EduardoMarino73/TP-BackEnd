import { Request, Response } from "express";
import { MovieRepository } from "./movie.repository.js";
import { MovieService } from "./movie.service.js";

/*El controlador se va a encargar de manejar la logica del negocio que me permite armar un paquete
con toda la informacion que voy a tener que devolver al FrontEnd */

const service = new MovieService(new MovieRepository());

/*El controlador llama al metodo puntual del DAO y retorna el valor devuelto por el mismo en forma de JSON */
export const findAll = (req:Request,res:Response) =>{
   res.json(service.finAll());
}

export const findOne = (req:Request,res:Response) =>{
    const id_Movie = req.params.id as string;
    const movie = service.findOne(id_Movie);

    if(!movie){
        return res.sendStatus(404).send({message: "movie not found"});
    }
    return res.send({movie});
}

export const create = (req:Request,res:Response) =>{
    const movie = service.create(req.body);
    return res.sendStatus(201).json({message: "movie created", data:movie});
}

export const update = (req:Request,res:Response) =>{
    const id_Movie = req.params.id as string;
    /* "req.body.sanitizeMovieInput" is a callback that clear all the undefined params of my movie object */
    const movie = service.update(id_Movie,req.body.sanitizeMovieInput);

    if(!movie){
        return res.sendStatus(404).send({message: "movie not found"});
    }
    return res.sendStatus(201).send({message: "movie updated",data:movie});
}

export const remove = (req:Request,res:Response) => {
    const id_Movie = req.params.id as string;
    const result = service.remove(id_Movie);

    if(!result){
        return res.sendStatus(500).send({message: "internal error"});
    }
    return res.sendStatus(201).send({message: `movie with id: ${result.id} was removed`});
}