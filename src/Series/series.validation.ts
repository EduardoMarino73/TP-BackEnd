import { NextFunction, Request, Response } from "express";
import { pickText, readFields, TextRule } from "../Shared/validation.js";

/**
 * The only fields a viewer can send for a series. The author comes from the token
 * and the state is set by the server, so neither is read from the request.
 */
const SERIES_FIELDS: Record<string, TextRule> = {
    title: { max: 255 },
    category: { max: 100 },
    description: { max: 5000, optional: true, allowEmpty: true },
};

/**
 * Builds the middleware that validates series data, for a new series ("create")
 * or an edit ("update", at least one field).
 * Supports both standard JSON request bodies and FormData-based payloads where fields are sent within 'data'.
 */
const sanitizeSeries = (mode: "create" | "update") => (req: Request, res: Response, next: NextFunction) => {
    const data = readFields(req);
    if (!data) return res.status(400).json({ message: "data must be a valid JSON object" });

    const result = pickText(data, SERIES_FIELDS, mode);
    if ("error" in result) return res.status(400).json({ message: result.error });

    req.body.sanitizeSeriesInput = result.values;
    next();
};

export const sanitizeSeriesInput = sanitizeSeries("create");
export const sanitizeSeriesUpdate = sanitizeSeries("update");
