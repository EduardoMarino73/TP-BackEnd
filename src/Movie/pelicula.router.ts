import { Router } from "express";
import { findAll } from "./movie.controlador.js";

/*EL router de peliculas se va a encargar de manejar todas las peticiones relacionadas con 
mis peliculas. Logrando asi invocar al metodo necesario en cada caso*/

export const peliculasRouter = Router()

peliculasRouter.get('/',findAll)
/*
...
...
... */