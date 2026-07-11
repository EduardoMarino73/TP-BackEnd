import { Router } from "express";
import { findAll } from "../peliculas/pelicula.controlador.js";

export const episodioRouter = Router()

episodioRouter.get('/',findAll)