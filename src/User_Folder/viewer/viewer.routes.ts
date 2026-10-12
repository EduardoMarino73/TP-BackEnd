import { Router } from "express";
import { authenticate, requireRole } from "../user.auth.js";
import { viewerProfile, viewerReports } from "./viewer.controller.js";

export const viewerRouter = Router();

// Viewer profile data is visible only to the signed-in viewer who owns it.
viewerRouter.get("/me", authenticate, requireRole("viewer"), viewerProfile);
// Moderation cases about the viewer's own content (case id, content, status and appeal).
viewerRouter.get("/me/reports", authenticate, requireRole("viewer"), viewerReports);
