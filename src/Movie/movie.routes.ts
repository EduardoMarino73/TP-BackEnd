import { Router } from "express";
import { findAll,findOne,findOneByPath,create,update,remove, streamMovie } from "./movie.controller.js";
import { sanitizeMovieInput, sanitizeMoviePathInput, sanitizeMovieUpdate } from "./movie.validation.js";
import { authenticate, requireRole } from "../User_Folder/user.auth.js";
import movieStorage from "./movie.storage.js";

/*The movie router handles all the requests related to
our movies, invoking the necessary method in each case*/

export const movieRouter = Router()

movieRouter.get('/',findAll)
movieRouter.get('/:id',findOne)
movieRouter.get('/:path',sanitizeMoviePathInput,findOneByPath)
// Writing requires a token. The token is checked before multer, so anonymous uploads never reach the disk.
movieRouter.post('/',authenticate,requireRole('viewer'),movieStorage.download.single('file'),sanitizeMovieInput,create)
movieRouter.put('/:id',authenticate,sanitizeMovieUpdate,update)
movieRouter.patch('/:id',authenticate,sanitizeMovieUpdate,update)
movieRouter.delete('/:id',authenticate,remove)

//movieRouter.get('/:id/stream', streamMovie)
