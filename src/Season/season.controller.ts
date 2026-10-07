import { Request, Response } from "express";
import { SeasonRepository } from "./season.repository.js";
import { SeasonService } from "./season.service.js";

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

/**
 * POST /api/seasons
 * Creates a new season under a given series.
 */
export const create = async (req: Request, res: Response) => {
    const seasonInput = req.body.sanitizeSeasonInput;

    const requiredFields = ["id_serie", "season_number", "description"] as const;
    const missingFields = requiredFields.filter((field) => seasonInput[field] === undefined);

    if (missingFields.length > 0) {
        return res.status(400).json({
            message: "Missing required season fields",
            fields: missingFields,
        });
    }

    try {
        const season = await service.create(seasonInput);
        return res.status(201).json({ message: "season created", data: season });
    } catch (error: any) {
        return res.status(400).json({ message: error.message || "Failed to create season" });
    }
};

/**
 * PUT /api/seasons/:id or PATCH /api/seasons/:id
 * Updates an existing season.
 */
export const update = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const season = await service.update(id, req.body.sanitizeSeasonInput);

    if (!season) {
        return res.status(404).json({ message: "season not found" });
    }
    return res.status(200).json({ message: "season updated", data: season });
};

/**
 * DELETE /api/seasons/:id
 * Removes a season by ID.
 */
export const remove = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await service.remove(id);

    if (!result) {
        return res.status(500).json({ message: "internal error or season not found" });
    }
    return res.status(200).json({ message: `season with id: ${id} was removed` });
};
