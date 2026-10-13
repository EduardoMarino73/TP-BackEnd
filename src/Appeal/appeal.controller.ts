import { NextFunction, Request, Response } from "express";
import { ReportService } from "../Report/report.service.js";

const reports = new ReportService();

/** Sends asynchronous controller errors to Express. */
function asyncHandler(
    action: (req: Request, res: Response) => Promise<unknown>,
) {
    return (req: Request, res: Response, next: NextFunction): void => {
        void action(req, res).catch(next);
    };
}

/** Submits an appeal for a report against the authenticated viewer's content. */
export const createAppeal = asyncHandler(async (req, res) => {
    const reportId = Number(req.body?.reportId);
    const description = req.body?.description;

    if (!Number.isSafeInteger(reportId) || reportId < 1) {
        return res.status(400).json({ message: "reportId must be a positive integer" });
    }
    if (typeof description !== "string" || !description.trim()
        || description.trim().length > 2000) {
        return res.status(400).json({
            message: "description is required and must be at most 2000 characters",
        });
    }

    const result = await reports.createAppeal({
        reportId,
        viewerId: req.user!.id_user,
        description: description.trim(),
    });
    if ("error" in result) {
        const status = result.error === "Report not found" ? 404 : 409;
        return res.status(status).json({ message: result.error });
    }

    return res.status(201).json({ data: result.appeal });
});

/** Withdraws a pending appeal of the authenticated viewer; the case can be appealed again. */
export const withdrawAppeal = asyncHandler(async (req, res) => {
    const appealId = Number(req.params.id);
    if (!Number.isSafeInteger(appealId) || appealId < 1) {
        return res.status(400).json({ message: "Invalid appeal id" });
    }

    const result = await reports.withdrawAppeal({ appealId, viewerId: req.user!.id_user });
    if ("error" in result) return res.status(result.status).json({ message: result.error });
    return res.sendStatus(204);
});
