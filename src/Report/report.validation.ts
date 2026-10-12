import { NextFunction, Request, Response } from "express";
import { readPositiveInt } from "../Shared/validation.js";

/**
 * Validates a new report: { targetType, targetId, reportTypeId, details? }.
 * details is optional here; the service requires it when the report type needs it ("Other").
 */
export function validateNewReport(req: Request, res: Response, next: NextFunction) {
    const { targetType, targetId, reportTypeId, details } = req.body ?? {};
    if (targetType !== "movie" && targetType !== "series") {
        return res.status(400).json({ message: "targetType must be movie or series" });
    }
    const target = readPositiveInt(targetId);
    if (!target) return res.status(400).json({ message: "targetId must be a positive integer" });
    const type = readPositiveInt(reportTypeId);
    if (!type) return res.status(400).json({ message: "reportTypeId must be a positive integer" });
    if (details !== undefined && details !== null && typeof details !== "string") {
        return res.status(400).json({ message: "details must be text" });
    }
    const text = typeof details === "string" ? details.trim() : "";
    if (text.length > 1000) {
        return res.status(400).json({ message: "details must be at most 1000 characters" });
    }

    req.body = { targetType, targetId: target, reportTypeId: type, details: text || null };
    return next();
}
