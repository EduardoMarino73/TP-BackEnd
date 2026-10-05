import { Request, Response } from "express";
import { SeriesRepository } from "./series.repository.js";
import { SeriesService } from "./series.service.js";

/**
 * Controller layer responsible for handling incoming HTTP requests and responses for Series.
 * It instantiates the service and repository dependencies.
 */
const service = new SeriesService(new SeriesRepository());

/**
 * GET /api/series
 * Returns all series as a JSON array.
 */
export const findAll = async (_req: Request, res: Response) => {
    const series = await service.findAll();
    return res.json(series);
};

/**
 * GET /api/series/:id
 * Fetches a single series by URL param ID.
 */
export const findOne = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const serie = await service.findOne(id);

    // If no series exists with the given ID, return 404 Not Found
    if (!serie) {
        return res.status(404).json({ message: "serie not found" });
    }
    return res.json({ serie });
};

/**
 * POST /api/series
 * Creates a new series from sanitized body data.
 */
export const create = async (req: Request, res: Response) => {
    const serieInput = req.body.sanitizeSeriesInput;

    // Verify all compulsory fields are provided
    const requiredFields = ["id_author", "title", "category", "description"] as const;
    const missingFields = requiredFields.filter((field) => serieInput[field] === undefined);

    if (missingFields.length > 0) {
        return res.status(400).json({
            message: "Missing required series fields",
            fields: missingFields,
        });
    }

    const serie = await service.create(serieInput);
    return res.status(201).json({ message: "serie created", data: serie });
};

/**
 * PUT /api/series/:id or PATCH /api/series/:id
 * Updates an existing series partially or completely.
 */
export const update = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const serie = await service.update(id, req.body.sanitizeSeriesInput);

    if (!serie) {
        return res.status(404).json({ message: "serie not found" });
    }
    return res.status(200).json({ message: "serie updated", data: serie });
};

/**
 * DELETE /api/series/:id
 * Removes a series from the database.
 */
export const remove = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await service.remove(id);

    if (!result) {
        return res.status(500).json({ message: "internal error or serie not found" });
    }
    return res.status(200).json({ message: `serie with id: ${id} was removed` });
};
