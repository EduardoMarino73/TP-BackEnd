import { NextFunction, Request, Response } from "express";
import { pickText, readFields, readPositiveInt, reject, TextRule } from "../Shared/validation.js";
import { thumbnailTooLarge, uploadedFile } from "../Shared/database/content.Storage.js";

/* Text fields a viewer can send. The author comes from the token, and
path, views and state are set by the server. */
const EPISODE_TEXT: Record<string, TextRule> = {
    title: { max: 255 },
    description: { max: 5000, optional: true, allowEmpty: true },
};

/**
 * Middleware that validates a new episode.
 * The JSON travels as a string inside req.body.data, next to the video file ("archivo").
 */
export const sanitizeEpisodeInput = (req: Request, res: Response, next: NextFunction) => {
    const data = readFields(req);
    if (!data) return reject(req, res, 400, "data must be a valid JSON object");

    const id_season = readPositiveInt(data.id_season);
    if (!id_season) return reject(req, res, 400, "id_season must be a positive integer");
    const episode_number = readPositiveInt(data.episode_number);
    if (!episode_number) return reject(req, res, 400, "episode_number must be a positive integer");

    const text = pickText(data, EPISODE_TEXT, "create");
    if ("error" in text) return reject(req, res, 400, text.error);
    if (!uploadedFile(req, "archivo")) return reject(req, res, 400, "A video file is required");
    if (thumbnailTooLarge(req)) return reject(req, res, 413, "The thumbnail is too large");

    req.body.sanitizeEpisodeInput = { id_season, episode_number, ...text.values };
    next();
};

/**
 * Middleware that validates an edit: episode_number, title and description
 * (an episode cannot be moved to another season, and its file cannot change).
 */
export const sanitizeEpisodeUpdate = (req: Request, res: Response, next: NextFunction) => {
    const data = readFields(req);
    if (!data) return res.status(400).json({ message: "data must be a valid JSON object" });

    const values: Record<string, string | number> = {};
    if (data.episode_number !== undefined) {
        const episode_number = readPositiveInt(data.episode_number);
        if (!episode_number) return res.status(400).json({ message: "episode_number must be a positive integer" });
        values.episode_number = episode_number;
    }
    const text = pickText(data, { ...EPISODE_TEXT, title: { max: 255, optional: true } }, "create");
    if ("error" in text) return res.status(400).json({ message: text.error });
    Object.assign(values, text.values);

    if (Object.keys(values).length === 0) {
        return res.status(400).json({ message: "Send at least one field to change" });
    }
    req.body.sanitizeEpisodeInput = values;
    next();
};
