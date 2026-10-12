import { Router } from "express";
import { authenticate, requireRole } from "../User_Folder/user.auth.js";
import { createReport, getReport, listReports } from "./complaint.controller.js";
import { validateCaseFilters, validateNewReport } from "./report.validation.js";

export const complaintRouter = Router();

// Only signed-in viewers can submit content reports.
complaintRouter.post("/", authenticate, requireRole("viewer"), validateNewReport, createReport);
// Administrators list and inspect moderation cases.
complaintRouter.get("/", authenticate, requireRole("administrator"), validateCaseFilters, listReports);
complaintRouter.get("/:id", authenticate, requireRole("administrator"), getReport);
