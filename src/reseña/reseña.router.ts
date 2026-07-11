import { Router } from "express";
import { findAll } from "./reseña.controlador.js";

const reseñaRouter = Router()

reseñaRouter.get('/',findAll)