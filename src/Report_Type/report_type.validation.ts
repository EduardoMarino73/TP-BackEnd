import { NextFunction, Request, Response } from "express";
import { pickText } from "../Shared/validation.js";

/**
 * Builds the middleware that validates a report type: { name, requiresDetails }.
 * "create" needs the name; "update" needs at least one of the two fields.
 */
const sanitizeReportType = (mode: "create" | "update") => (req: Request, res: Response, next: NextFunction) => {
    const body = req.body ?? {};
    const text = pickText(body, { name: { max: 100, optional: mode === "update" } }, "create");
    if ("error" in text) return res.status(400).json({ message: text.error });

    const values: { name?: string; requiresDetails?: boolean } = { ...text.values };
    if (body.requiresDetails !== undefined) {
        if (typeof body.requiresDetails !== "boolean") {
            return res.status(400).json({ message: "requiresDetails must be boolean" });
        }
        values.requiresDetails = body.requiresDetails;
    }
    if (Object.keys(values).length === 0) {
        return res.status(400).json({ message: "Send at least one field to change" });
    }
    req.body = values;
    return next();
};

export const sanitizeReportTypeInput = sanitizeReportType("create");
export const sanitizeReportTypeUpdate = sanitizeReportType("update");
