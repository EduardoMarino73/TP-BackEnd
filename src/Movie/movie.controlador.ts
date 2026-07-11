import { Request, Response } from "express";
import { MovieRepository } from "./movie.repository.js";

/*El controlador se va a encargar de manejar la logica del negocio que me permite armar un paquete
con toda la informacion que voy a tener que devolver al FrontEnd */

const repositorio =  new MovieRepository()

/*El controlador llama al metodo puntual del DAO y retorna el valor devuelto por el mismo en forma de JSON */
function findAll(req:Request,res:Response){
    res.json({data: repositorio.findAll()})
}

export{findAll}