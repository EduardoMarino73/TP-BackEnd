import { Router } from "express";
import { findAll,findOne,findOneByPath,create,update,remove, streamMovie } from "./movie.controller.js";
import { sanitizeMovieInput, sanitizeMoviePathInput } from "./movie.validation.js";
import movieStorage from "./movie.storage.js";

/*The movie router handles all the requests related to
our movies, invoking the necessary method in each case*/

export const movieRouter = Router()

movieRouter.get('/',findAll)
movieRouter.get('/:id',findOne)
movieRouter.get('/:path',sanitizeMoviePathInput,findOneByPath)
movieRouter.post('/',movieStorage.download.single('archivo'),sanitizeMovieInput,create)
movieRouter.put('/:id',sanitizeMovieInput,update)
movieRouter.patch('/:id',sanitizeMovieInput,update)
movieRouter.delete('/:id',remove)

//movieRouter.get('/:id/stream', streamMovie)
//movieRouter.post('/',movieStorage.download.single('file'),sanitizeMovieInput,create)