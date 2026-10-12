import { Router } from "express";
import { authenticate, requireRole } from "../User_Folder/user.auth.js";
import { createReport, getReport } from "./complaint.controller.js";
import { validateNewReport } from "./report.validation.js";

export const complaintRouter = Router();

// Only signed-in viewers can submit content reports.
complaintRouter.post("/", authenticate, requireRole("viewer"), validateNewReport, createReport);
complaintRouter.get("/:id", authenticate, requireRole("administrator"), getReport);
