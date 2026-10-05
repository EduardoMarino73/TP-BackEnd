import { NextFunction, Request, Response } from "express";

/**
 * Middleware that extracts and cleanses episode payload attributes.
 * Handles FormData parsing when video binary and metadata are sent together.
 */
export const sanitizeEpisodeInput = (req: Request, _res: Response, next: NextFunction) => {
    let data: any = req.body;

    // Parse JSON string if sent within FormData (e.g. data field)
    if (typeof req.body.data === "string") {
        try {
            data = JSON.parse(req.body.data);
        } catch {
            data = req.body;
        }
    }

    req.body.sanitizeEpisodeInput = {
        id_season: data.id_season !== undefined ? Number(data.id_season) : undefined,
        episode_number: data.episode_number !== undefined ? Number(data.episode_number) : undefined,
        title: data.title,
        description: data.description,
        path: data.path,
        id_author: data.id_author !== undefined ? Number(data.id_author) : undefined,
        views: data.views !== undefined ? Number(data.views) : undefined,
        state: data.state,
    };

    // Strip undefined properties to support partial updates
    Object.keys(req.body.sanitizeEpisodeInput).forEach((key) => {
        if (req.body.sanitizeEpisodeInput[key] === undefined) {
            delete req.body.sanitizeEpisodeInput[key];
        }
    });

    next();
};
