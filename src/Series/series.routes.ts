import { Router } from "express";
import { findAll, findOne, create, update, remove } from "./series.controller.js";
import { sanitizeSeriesInput } from "./series.validation.js";

/**
 * Express router for Series endpoints (/api/series).
 * Maps HTTP methods and paths to their respective middlewares and controller handlers.
 */
export const seriesRouter = Router();

// Retrieve all series
seriesRouter.get("/", findAll);

// Retrieve a single series by ID
seriesRouter.get("/:id", findOne);

// Create a new series (sanitizes input before invoking controller)
seriesRouter.post("/", sanitizeSeriesInput, create);

// Replace / update a series by ID
seriesRouter.put("/:id", sanitizeSeriesInput, update);

// Partially update a series by ID
seriesRouter.patch("/:id", sanitizeSeriesInput, update);

// Delete a series by ID
seriesRouter.delete("/:id", remove);
