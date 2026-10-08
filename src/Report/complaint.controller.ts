import { NextFunction, Request, Response } from "express";
import { ReportTargetType } from "./complaint.entity.js";
import { ReportService } from "./report.service.js";

const reports = new ReportService();

/** Sends asynchronous controller errors to Express. */
function asyncHandler(
    action: (req: Request, res: Response) => Promise<unknown>,
) {
    return (req: Request, res: Response, next: NextFunction): void => {
        void action(req, res).catch(next);
    };
}

/** Creates a content report from the authenticated viewer. */
export const createReport = asyncHandler(async (req, res) => {
    const { targetType, targetId, reason } = req.body ?? {};
    if (targetType !== "movie" && targetType !== "series") {
        return res.status(400).json({ message: "targetType must be movie or series" });
    }
    if (!Number.isSafeInteger(Number(targetId)) || Number(targetId) < 1) {
        return res.status(400).json({ message: "targetId must be a positive integer" });
    }
    if (typeof reason !== "string" || !reason.trim() || reason.trim().length > 1000) {
        return res.status(400).json({ message: "reason is required and must be at most 1000 characters" });
    }

    const result = await reports.createReport({
        targetType: targetType as ReportTargetType,
        targetId: Number(targetId),
        reporterId: req.user!.id_user,
        reason: reason.trim(),
    });
    if ("error" in result) {
        const status = result.error === "Content not found" ? 404 : 409;
        return res.status(status).json({ message: result.error });
    }

    return res.status(201).json({
        data: result.report,
        reportCount: result.reportCount,
        complaint: result.complaintCreated ?? null,
    });
});

/** Returns report details for an administrator reviewing an appeal. */
export const getReport = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) {
        return res.status(400).json({ message: "Invalid report id" });
    }

    const result = await reports.getReport(id);
    if (!result) return res.status(404).json({ message: "Report not found" });
    return res.json({
        data: result.complaint,
        reportCount: result.reportCount,
        reports: result.reports,
    });
});
