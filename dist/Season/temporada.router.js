import { Router } from "express";
import { findAll } from "./season.controller.js";
export const temporadaRouter = Router();
temporadaRouter.get('/', findAll);
//# sourceMappingURL=temporada.router.js.map