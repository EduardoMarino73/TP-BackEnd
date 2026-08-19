import { Router } from "express";
import { findAll,findOne,create,update,remove } from "./movie.controller.js";
import { sanitizeMovieInput } from "./movie.validation.js";
import movieStorage from "./movie.storage.js";

/*EL router de peliculas se va a encargar de manejar todas las peticiones relacionadas con 
mis peliculas. Logrando asi invocar al metodo necesario en cada caso*/

export const movieRouter = Router()

movieRouter.get('/',findAll)
movieRouter.get('/:id',findOne)
movieRouter.post('/',movieStorage.download.single('archivo'),sanitizeMovieInput,create)
movieRouter.put('/:id',sanitizeMovieInput,update)
movieRouter.patch('/:id',sanitizeMovieInput,update)
movieRouter.delete('/:id',remove)