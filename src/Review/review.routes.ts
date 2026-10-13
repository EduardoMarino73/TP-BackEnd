import { Router } from "express";
import { create, findAll, findByAudiovisual, findByViewer, findOne, remove, update } from "./review.controller.js";
import { validateNewReview, validateReviewChange } from "./review.validation.js";
import { authenticate, requireRole } from "../User_Folder/user.auth.js";

export const reviewRouter = Router();

// Declare specific routes before /:id so Express matches them correctly.
reviewRouter.get("/", findAll);
reviewRouter.get("/viewer/:viewerId", findByViewer);
reviewRouter.get("/audiovisual/:type/:audiovisualId", findByAudiovisual);
reviewRouter.get("/:id", findOne);
// Only signed-in viewers rate; the viewer is taken from the token and can only change their own rating.
reviewRouter.post("/", authenticate, requireRole("viewer"), validateNewReview, create);
reviewRouter.patch("/:id", authenticate, validateReviewChange, update);
reviewRouter.put("/:id", authenticate, validateReviewChange, update);
reviewRouter.delete("/:id", authenticate, remove);
