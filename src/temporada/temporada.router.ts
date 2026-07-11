import { Router } from "express";
import { findAll } from "./temporada.controlador.js";

export const temporadaRouter = Router()

temporadaRouter.get('/',findAll)