import { Request, Response } from "express";
import { SeriesRepository } from "./series.repository.js";
import { SeriesService } from "./series.service.js";
import { sendOwnershipError } from "../Shared/ownership.js";
import { thumbnailUrl, uploadedFile } from "../Shared/database/content.Storage.js";

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
 * Creates a new series from sanitized body data. The uploader is the owner of the token.
 */
export const create = async (req: Request, res: Response) => {
    const serie = await service.create({
        ...req.body.sanitizeSeriesInput,
        id_author: req.user!.id_user,
        thumbnail_path: thumbnailUrl(uploadedFile(req, "thumbnail")),
    });
    return res.status(201).json({ message: "serie created", data: serie });
};

/**
 * PUT /api/series/:id or PATCH /api/series/:id
 * Updates title, category or description. Only the uploader can do it (403 otherwise).
 */
export const update = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await service.update(id, req.body.sanitizeSeriesInput, req.user!.id_user);

    if (sendOwnershipError(res, result, "serie not found")) return;
    return res.status(200).json({ message: "serie updated", data: result.data });
};

/**
 * DELETE /api/series/:id
 * Removes a series. Only the uploader can do it (403 otherwise).
 */
export const remove = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await service.remove(id, req.user!.id_user);

    if (sendOwnershipError(res, result, "serie not found")) return;
    return res.status(200).json({ message: `serie with id: ${id} was removed` });
};
