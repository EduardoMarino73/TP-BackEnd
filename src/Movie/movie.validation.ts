import { NextFunction, Request, Response } from "express";
import { pickText, readFields, reject, TextRule } from "../Shared/validation.js";
import { thumbnailTooLarge, uploadedFile } from "../Shared/database/content.Storage.js";

export const sanitizeMoviePathInput = (req:Request,res:Response,next:NextFunction) => {
    const data = readFields(req) ?? {};

    req.body.sanitizeMoviePathInput = {
        path: data.path
    }

    if(req.body.sanitizeMoviePathInput.path === undefined) {
        delete req.body.sanitizeMoviePathInput.path;
    }

    next()
}

/* The only fields a viewer can send. The author comes from the token, and
views, state and path are set by the server, so they are never read from the request. */
const MOVIE_FIELDS: Record<string, TextRule> = {
    title: { max: 255 },
    category: { max: 100 },
    description: { max: 5000, optional: true, allowEmpty: true },
};

/** Validates a new movie: the JSON travels as a string inside req.body.data, next to the video file. */
export const sanitizeMovieInput = (req:Request, res:Response, next:NextFunction) => {
    const data = readFields(req);
    if (!data) return reject(req, res, 400, "data must be a valid JSON object");

    const result = pickText(data, MOVIE_FIELDS, "create");
    if ("error" in result) return reject(req, res, 400, result.error);
    if (!uploadedFile(req, "file")) return reject(req, res, 400, "A video file is required");
    if (thumbnailTooLarge(req)) return reject(req, res, 413, "The thumbnail is too large");

    req.body.sanitizeMovieInput = result.values;
    next()
}

/** Validates an edit from "My Videos": only title, category and description can change. */
export const sanitizeMovieUpdate = (req:Request, res:Response, next:NextFunction) => {
    const data = readFields(req);
    if (!data) return res.status(400).json({ message: "data must be a valid JSON object" });

    const result = pickText(data, MOVIE_FIELDS, "update");
    if ("error" in result) return res.status(400).json({ message: result.error });

    req.body.sanitizeMovieInput = result.values;
    next()
}
