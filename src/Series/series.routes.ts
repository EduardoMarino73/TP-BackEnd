import { Router } from "express";
import { findAll, findOne, create, update, remove } from "./series.controller.js";
import { sanitizeSeriesInput, sanitizeSeriesUpdate } from "./series.validation.js";
import { authenticate, requireRole } from "../User_Folder/user.auth.js";
import seriesStorage from "./series.storage.js";

/**
 * Express router for Series endpoints (/api/series).
 * Maps HTTP methods and paths to their respective middlewares and controller handlers.
 * Every write needs a token; only the uploader can edit or delete a series.
 */
export const seriesRouter = Router();

// Retrieve all series
seriesRouter.get("/", findAll);

// Retrieve a single series by ID
seriesRouter.get("/:id", findOne);

// Create a new series (sanitizes input before invoking controller).
// It accepts JSON, or multipart with "data" and an optional "thumbnail" cover image.
seriesRouter.post("/", authenticate, requireRole("viewer"), seriesStorage.download.single("thumbnail"), sanitizeSeriesInput, create);

// Replace / update a series by ID
seriesRouter.put("/:id", authenticate, sanitizeSeriesUpdate, update);

// Partially update a series by ID
seriesRouter.patch("/:id", authenticate, sanitizeSeriesUpdate, update);

// Delete a series by ID
seriesRouter.delete("/:id", authenticate, remove);
