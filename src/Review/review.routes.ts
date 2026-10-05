import { Router } from "express";
import { create, findAll, findByAudiovisual, findByViewer, findOne, remove, update } from "./review.controller.js";

export const reviewRouter = Router();

// Declare specific routes before /:id so Express matches them correctly.
reviewRouter.get("/", findAll);
reviewRouter.get("/viewer/:viewerId", findByViewer);
reviewRouter.get("/audiovisual/:type/:audiovisualId", findByAudiovisual);
reviewRouter.get("/:id", findOne);
reviewRouter.post("/", create);
reviewRouter.patch("/:id", update);
reviewRouter.put("/:id", update);
reviewRouter.delete("/:id", remove);
