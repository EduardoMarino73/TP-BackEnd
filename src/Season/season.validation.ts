import { NextFunction, Request, Response } from "express";

/**
 * Middleware that validates and sanitizes input data for Season operations.
 * Ensures numbers are properly cast and undefined values are removed.
 */
export const sanitizeSeasonInput = (req: Request, _res: Response, next: NextFunction) => {
    let data: any = req.body;

    // Handle FormData JSON payloads if sent under the 'data' field
    if (typeof req.body.data === "string") {
        try {
            data = JSON.parse(req.body.data);
        } catch {
            data = req.body;
        }
    }

    req.body.sanitizeSeasonInput = {
        id_serie: data.id_serie !== undefined ? Number(data.id_serie) : undefined,
        season_number: data.season_number !== undefined ? Number(data.season_number) : undefined,
        description: data.description,
    };

    // Remove undefined fields for partial updates
    Object.keys(req.body.sanitizeSeasonInput).forEach((key) => {
        if (req.body.sanitizeSeasonInput[key] === undefined) {
            delete req.body.sanitizeSeasonInput[key];
        }
    });

    next();
};
