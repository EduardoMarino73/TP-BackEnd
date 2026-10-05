import { NextFunction, Request, Response } from "express";

/**
 * Middleware that extracts, sanitizes, and prepares series payload data from the HTTP request.
 * Supports both standard JSON request bodies and FormData-based payloads where fields are sent within 'data'.
 */
export const sanitizeSeriesInput = (req: Request, _res: Response, next: NextFunction) => {
    let data: any = req.body;

    // If payload was stringified inside FormData (req.body.data), attempt to parse it
    if (typeof req.body.data === "string") {
        try {
            data = JSON.parse(req.body.data);
        } catch {
            data = req.body;
        }
    }

    // Structure sanitized fields with appropriate data types
    req.body.sanitizeSeriesInput = {
        id_author: data.id_author !== undefined ? Number(data.id_author) : undefined,
        title: data.title,
        category: data.category,
        description: data.description,
        state: data.state ?? "active",
    };

    // Remove any undefined keys so partial updates do not overwrite database columns with undefined
    Object.keys(req.body.sanitizeSeriesInput).forEach((key) => {
        if (req.body.sanitizeSeriesInput[key] === undefined) {
            delete req.body.sanitizeSeriesInput[key];
        }
    });

    next();
};
