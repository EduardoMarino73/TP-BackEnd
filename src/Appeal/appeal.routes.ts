import { Router } from "express";
import { authenticate, requireRole } from "../User_Folder/user.auth.js";
import { createAppeal } from "./appeal.controller.js";

export const appealRouter = Router();

// A viewer may appeal a report only against content they own.
appealRouter.post("/", authenticate, requireRole("viewer"), createAppeal);
