import { Request, Response } from "express";
import { SeasonRepository } from "./season.repository.js";
import { SeasonService } from "./season.service.js";
import { sendOwnershipError } from "../Shared/ownership.js";

/**
 * Controller layer for Seasons. Orchestrates requests from Express and responses to clients.
 */
const service = new SeasonService(new SeasonRepository());

/**
 * GET /api/seasons
 * Retrieves all seasons.
 */
export const findAll = async (_req: Request, res: Response) => {
    const seasons = await service.findAll();
    return res.json(seasons);
};

/**
 * GET /api/seasons/:id
 * Retrieves a single season by its primary key.
 */
export const findOne = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const season = await service.findOne(id);

    if (!season) {
        return res.status(404).json({ message: "season not found" });
    }
    return res.json({ season });
};

/**
 * GET /api/seasons/serie/:serieId
 * Specialized endpoint: returns all seasons belonging to a specific series.
 */
export const findBySerie = async (req: Request, res: Response) => {
    const serieId = req.params.serieId as string;
    const seasons = await service.findBySerie(serieId);
    return res.json(seasons);
};

/** MySQL error raised by the unique (series, season number) key. */
const isDuplicate = (error: unknown) => (error as { code?: string }).code === "ER_DUP_ENTRY";
const DUPLICATE_MESSAGE = "That season number already exists in this series";

/**
 * POST /api/seasons
 * Creates a new season under a series uploaded by the user (403 otherwise).
 */
export const create = async (req: Request, res: Response) => {
    try {
        const result = await service.create(req.body.sanitizeSeasonInput, req.user!.id_user);
        if (sendOwnershipError(res, result, "serie not found")) return;
        return res.status(201).json({ message: "season created", data: result.data });
    } catch (error) {
        if (isDuplicate(error)) return res.status(409).json({ message: DUPLICATE_MESSAGE });
        throw error;
    }
};

/**
 * PUT /api/seasons/:id or PATCH /api/seasons/:id
 * Updates the number or the description of a season.
 */
export const update = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    try {
        const result = await service.update(id, req.body.sanitizeSeasonInput, req.user!.id_user);
        if (sendOwnershipError(res, result, "season not found")) return;
        return res.status(200).json({ message: "season updated", data: result.data });
    } catch (error) {
        if (isDuplicate(error)) return res.status(409).json({ message: DUPLICATE_MESSAGE });
        throw error;
    }
};

/**
 * DELETE /api/seasons/:id
 * Removes a season by ID.
 */
export const remove = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await service.remove(id, req.user!.id_user);

    if (sendOwnershipError(res, result, "season not found")) return;
    return res.status(200).json({ message: `season with id: ${id} was removed` });
};
