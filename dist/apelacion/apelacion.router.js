import { Router } from "express";
import { findAll } from "./apelacion.controlador.js";
const apelacionRouter = Router();
apelacionRouter.get('/', findAll);
//# sourceMappingURL=apelacion.router.js.map