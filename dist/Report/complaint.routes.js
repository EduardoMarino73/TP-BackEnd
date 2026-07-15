import { Router } from "express";
import { findAll } from "./complaint.controller.js";
const denunciaRouter = Router();
denunciaRouter.get('/', findAll);
//# sourceMappingURL=complaint.routes.js.map