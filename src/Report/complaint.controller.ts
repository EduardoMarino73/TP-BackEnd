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
    // the body was checked by validateNewReport
    const { targetType, targetId, reportTypeId, details } = req.body;

    const result = await reports.createReport({
        targetType: targetType as ReportTargetType,
        targetId,
        reporterId: req.user!.id_user,
        reportTypeId,
        details,
    });
    if ("error" in result) {
        const status = result.error === "Content not found" ? 404
            : "invalid" in result ? 400 : 409;
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
        // the case with its content, owner, grouped reasons and appeal
        data: result.summary,
        reportCount: result.reportCount,
        reports: result.reports,
    });
});

/** Lists moderation cases for administrators, filtered by id, status and report type. */
export const listReports = asyncHandler(async (_req, res) => {
    return res.json({ data: await reports.listCases(res.locals.caseFilters) });
});
