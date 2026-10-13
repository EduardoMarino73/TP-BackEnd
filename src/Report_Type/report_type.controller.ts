import { Request, Response } from "express";
import { ReportTypeService } from "./report_type.service.js";

const service = new ReportTypeService();

const errorCode = (error: unknown) => (error as { code?: string }).code;
const DUPLICATE_MESSAGE = "A report type with that name already exists";

/** GET /api/report-types: the catalog shown in the report form (public). */
export const findAll = async (_req: Request, res: Response) => {
    return res.json({ data: await service.findAll() });
};

/** GET /api/report-types/:id */
export const findOne = async (req: Request, res: Response) => {
    const reportType = await service.findOne(Number(req.params.id));
    if (!reportType) return res.status(404).json({ message: "Report type not found" });
    return res.json({ data: reportType });
};

/** POST /api/report-types (administrators only) */
export const create = async (req: Request, res: Response) => {
    try {
        return res.status(201).json({ data: await service.create(req.body) });
    } catch (error) {
        if (errorCode(error) === "ER_DUP_ENTRY") return res.status(409).json({ message: DUPLICATE_MESSAGE });
        throw error;
    }
};

/** PATCH /api/report-types/:id (administrators only) */
export const update = async (req: Request, res: Response) => {
    try {
        const reportType = await service.update(Number(req.params.id), req.body);
        if (!reportType) return res.status(404).json({ message: "Report type not found" });
        return res.json({ data: reportType });
    } catch (error) {
        if (errorCode(error) === "ER_DUP_ENTRY") return res.status(409).json({ message: DUPLICATE_MESSAGE });
        throw error;
    }
};

/** DELETE /api/report-types/:id (administrators only). A type that reports already use cannot be deleted. */
export const remove = async (req: Request, res: Response) => {
    try {
        const removed = await service.remove(Number(req.params.id));
        if (!removed) return res.status(404).json({ message: "Report type not found" });
        return res.sendStatus(204);
    } catch (error) {
        if (errorCode(error) === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({ message: "This report type is used by existing reports, so it cannot be deleted" });
        }
        throw error;
    }
};
