import { NextFunction, Request, Response } from "express";
import { readPositiveInt } from "../Shared/validation.js";

/** A new item: { audiovisualId, audiovisualType: "movie" | "series" }. The viewer comes from the token. */
export function validateWatchLaterInput(req: Request, res: Response, next: NextFunction) {
    const { audiovisualId, audiovisualType } = req.body ?? {};
    const id = readPositiveInt(audiovisualId);
    if (!id || (audiovisualType !== "movie" && audiovisualType !== "series")) {
        return res.status(400).json({
            message: "audiovisualId and audiovisualType (movie or series) are required",
        });
    }
    req.body = { audiovisualId: id, audiovisualType };
    return next();
}
