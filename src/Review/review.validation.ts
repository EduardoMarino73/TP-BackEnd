import { NextFunction, Request, Response } from "express";
import { AudiovisualType } from "./review.entity.js";
import { readPositiveInt } from "../Shared/validation.js";

// Restricts review links to the content tables available in this project.
export const AUDIOVISUAL_TYPES: AudiovisualType[] = ["movie", "episode"];

/** A new rating: { rating, audiovisualId, audiovisualType }. The viewer comes from the token. */
export function validateNewReview(req: Request, res: Response, next: NextFunction) {
    const { rating, audiovisualId, audiovisualType } = req.body ?? {};
    const id = readPositiveInt(audiovisualId);
    if (typeof rating !== "boolean" || !id || !AUDIOVISUAL_TYPES.includes(audiovisualType)) {
        return res.status(400).json({
            message: "rating (boolean), audiovisualId and audiovisualType (movie or episode) are required",
        });
    }
    req.body = { rating, audiovisualId: id, audiovisualType };
    return next();
}

/** A change of rating: only { rating } can change (like <-> dislike). */
export function validateReviewChange(req: Request, res: Response, next: NextFunction) {
    const { rating } = req.body ?? {};
    if (typeof rating !== "boolean") {
        return res.status(400).json({ message: "rating must be boolean" });
    }
    req.body = { rating };
    return next();
}
