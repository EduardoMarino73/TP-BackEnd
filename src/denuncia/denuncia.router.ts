import { Router } from "express";
import { findAll } from "./denuncia.controlador.js";

const denunciaRouter = Router()

denunciaRouter.get('/',findAll)