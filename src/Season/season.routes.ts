import { Router } from "express";
import { findAll, findOne, findBySerie, create, update, remove } from "./season.controller.js";
import { sanitizeSeasonInput, sanitizeSeasonUpdate } from "./season.validation.js";
import { authenticate, requireRole } from "../User_Folder/user.auth.js";

/**
 * Express router for Seasons (/api/seasons).
 * Every write needs a token; only the uploader of the series can change its seasons.
 */
export const seasonRouter = Router();

// Retrieve all seasons
seasonRouter.get("/", findAll);

// Retrieve a single season by ID
seasonRouter.get("/:id", findOne);

// Retrieve all seasons belonging to a specific series
seasonRouter.get("/serie/:serieId", findBySerie);

// Create a new season
seasonRouter.post("/", authenticate, requireRole("viewer"), sanitizeSeasonInput, create);

// Update a season by ID
seasonRouter.put("/:id", authenticate, sanitizeSeasonUpdate, update);

// Partially update a season by ID
seasonRouter.patch("/:id", authenticate, sanitizeSeasonUpdate, update);

// Delete a season by ID
seasonRouter.delete("/:id", authenticate, remove);
