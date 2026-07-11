import { Router } from "express";
import { findAll } from "./tipo_reporte.controlador.js";

const tipo_reporteRouter = Router()

tipo_reporteRouter.get('/',findAll)