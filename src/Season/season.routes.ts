import { Router } from "express";
import { findAll, findOne, findBySerie, create, update, remove } from "./season.controller.js";
import { sanitizeSeasonInput } from "./season.validation.js";

/**
 * Express router for Seasons (/api/seasons).
 */
export const seasonRouter = Router();

// Retrieve all seasons
seasonRouter.get("/", findAll);

// Retrieve a single season by ID
seasonRouter.get("/:id", findOne);

// Retrieve all seasons belonging to a specific series
seasonRouter.get("/serie/:serieId", findBySerie);

// Create a new season
seasonRouter.post("/", sanitizeSeasonInput, create);

// Update a season by ID
seasonRouter.put("/:id", sanitizeSeasonInput, update);

// Partially update a season by ID
seasonRouter.patch("/:id", sanitizeSeasonInput, update);

// Delete a season by ID
seasonRouter.delete("/:id", remove);
