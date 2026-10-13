import { NextFunction, Request, Response } from "express";
import { pickText, readFields, readPositiveInt } from "../Shared/validation.js";

/**
 * Builds the middleware that validates season data.
 * "create" needs id_serie and season_number; "update" accepts season_number and description
 * (a season cannot be moved to another series).
 */
const sanitizeSeason = (mode: "create" | "update") => (req: Request, res: Response, next: NextFunction) => {
    const data = readFields(req);
    if (!data) return res.status(400).json({ message: "data must be a valid JSON object" });

    const values: Record<string, string | number> = {};
    if (mode === "create") {
        const id_serie = readPositiveInt(data.id_serie);
        if (!id_serie) return res.status(400).json({ message: "id_serie must be a positive integer" });
        values.id_serie = id_serie;
    }
    if (mode === "create" || data.season_number !== undefined) {
        const season_number = readPositiveInt(data.season_number);
        if (!season_number) return res.status(400).json({ message: "season_number must be a positive integer" });
        values.season_number = season_number;
    }

    const text = pickText(data, { description: { max: 5000, optional: true, allowEmpty: true } }, "create");
    if ("error" in text) return res.status(400).json({ message: text.error });
    Object.assign(values, text.values);

    if (Object.keys(values).length === 0) {
        return res.status(400).json({ message: "Send at least one field to change" });
    }
    req.body.sanitizeSeasonInput = values;
    next();
};

export const sanitizeSeasonInput = sanitizeSeason("create");
export const sanitizeSeasonUpdate = sanitizeSeason("update");
