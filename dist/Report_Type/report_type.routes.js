import { Router } from "express";
import { findAll } from "./report_type.controller.js";
const tipo_reporteRouter = Router();
tipo_reporteRouter.get('/', findAll);
//# sourceMappingURL=report_type.routes.js.map