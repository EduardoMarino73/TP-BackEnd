import { Router } from "express";
import { authenticate, requireRole } from "../User_Folder/user.auth.js";
import { createReport, getReport } from "./complaint.controller.js";

export const complaintRouter = Router();

// Only signed-in viewers can submit content reports.
complaintRouter.post("/", authenticate, requireRole("viewer"), createReport);
complaintRouter.get("/:id", authenticate, requireRole("administrator"), getReport);
