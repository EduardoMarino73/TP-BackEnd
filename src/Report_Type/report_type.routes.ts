import { Router } from "express";
import { create, findAll, findOne, remove, update } from "./report_type.controller.js";
import { sanitizeReportTypeInput, sanitizeReportTypeUpdate } from "./report_type.validation.js";
import { authenticate, requireRole } from "../User_Folder/user.auth.js";

/** /api/report-types: anyone can read the catalog; only administrators change it. */
export const reportTypeRouter = Router()

const administratorOnly = [authenticate, requireRole("administrator")];

reportTypeRouter.get('/',findAll)
reportTypeRouter.get('/:id',findOne)
reportTypeRouter.post('/',...administratorOnly,sanitizeReportTypeInput,create)
reportTypeRouter.patch('/:id',...administratorOnly,sanitizeReportTypeUpdate,update)
reportTypeRouter.delete('/:id',...administratorOnly,remove)
