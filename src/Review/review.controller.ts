import { Request, Response } from "express";
import { ReviewRepository } from "./review.repository.js";
import { ReviewService } from "./review.service.js";
import { AudiovisualType, Review } from "./review.entity.js";

const service = new ReviewService(new ReviewRepository());
// Restricts review links to the content tables available in this project.
const types: AudiovisualType[] = ["movie", "episode"];

/** Returns all registered reviews. */
export const findAll = async (_req: Request, res: Response) => res.json(await service.findAll());

/** Returns a review by ID or responds with 404 if it does not exist. */
export const findOne = async (req: Request, res: Response) => {
    const review = await service.findOne(req.params.id as string);
    return review ? res.json({ data: review }) : res.sendStatus(404);
};

/** Filters reviews by viewer ID. */
export const findByViewer = async (req: Request, res: Response) => {
    const reviews = await service.findByViewer(req.params.viewerId as string);
    return reviews ? res.json({ data: reviews }) : res.status(400).json({ message: "Invalid viewer id" });
};

/** Filters by type and ID to distinguish movie IDs from episode IDs. */
export const findByAudiovisual = async (req: Request, res: Response) => {
    const type = req.params.type as AudiovisualType;
    if (!types.includes(type)) return res.status(400).json({ message: "type must be movie or episode" });
    const reviews = await service.findByAudiovisual(type, req.params.audiovisualId as string);
    return reviews ? res.json({ data: reviews }) : res.status(400).json({ message: "Invalid audiovisual id" });
};

/** Validates required fields and creates a new rating. */
export const create = async (req: Request, res: Response) => {
    const { viewerId, rating, audiovisualId, audiovisualType } = req.body ?? {};
    if (!Number.isInteger(viewerId) || viewerId < 1 || typeof rating !== "boolean" ||
        !Number.isInteger(audiovisualId) || audiovisualId < 1 || !types.includes(audiovisualType)) {
        return res.status(400).json({ message: "viewerId, audiovisualId, rating (boolean), and audiovisualType (movie or episode) are required" });
    }
    try {
        const review = await service.create(new Review(viewerId, rating, audiovisualId, audiovisualType));
        return res.status(201).json({ message: "review created", data: review });
    } catch (error) {
        // A viewer may rate a given audiovisual once; a second POST returns 409.
        if ((error as { code?: string }).code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Viewer already reviewed this audiovisual" });
        throw error;
    }
};

/** Applies a partial update after validating each supplied field. */
export const update = async (req: Request, res: Response) => {
    const input: Partial<Review> = {};
    const body = req.body ?? {};
    if (body.rating !== undefined) {
        if (typeof body.rating !== "boolean") return res.status(400).json({ message: "rating must be boolean" });
        input.rating = body.rating;
    }
    if (body.viewerId !== undefined) {
        if (!Number.isInteger(body.viewerId) || body.viewerId < 1) return res.status(400).json({ message: "viewerId must be a positive integer" });
        input.viewerId = body.viewerId;
    }
    if (body.audiovisualId !== undefined) {
        if (!Number.isInteger(body.audiovisualId) || body.audiovisualId < 1) return res.status(400).json({ message: "audiovisualId must be a positive integer" });
        input.audiovisualId = body.audiovisualId;
    }
    if (body.audiovisualType !== undefined) {
        if (!types.includes(body.audiovisualType)) return res.status(400).json({ message: "audiovisualType must be movie or episode" });
        input.audiovisualType = body.audiovisualType;
    }
    const review = await service.update(req.params.id as string, input);
    return review ? res.json({ message: "review updated", data: review }) : res.sendStatus(404);
};

/** Deletes a review or responds with 404 when the ID is not registered. */
export const remove = async (req: Request, res: Response) => {
    const removed = await service.remove(req.params.id as string);
    return removed ? res.sendStatus(204) : res.sendStatus(404);
};
