import { Request, Response } from "express";
import { ReviewRepository } from "./review.repository.js";
import { ReviewService } from "./review.service.js";
import { AudiovisualType, Review } from "./review.entity.js";
import { AUDIOVISUAL_TYPES } from "./review.validation.js";
import { sendOwnershipError } from "../Shared/ownership.js";

const service = new ReviewService(new ReviewRepository());
const types = AUDIOVISUAL_TYPES;

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

/** Creates a new rating for the viewer who owns the token. */
export const create = async (req: Request, res: Response) => {
    const { rating, audiovisualId, audiovisualType } = req.body;
    try {
        const review = await service.create(new Review(req.user!.id_user, rating, audiovisualId, audiovisualType));
        if (!review) return res.status(404).json({ message: "audiovisual not found" });
        return res.status(201).json({ message: "review created", data: review });
    } catch (error) {
        // A viewer may rate a given audiovisual once; a second POST returns 409.
        if ((error as { code?: string }).code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Viewer already reviewed this audiovisual" });
        throw error;
    }
};

const FORBIDDEN_MESSAGE = "You can only change your own rating";

/** Changes like <-> dislike. Only the viewer who wrote the review can do it. */
export const update = async (req: Request, res: Response) => {
    const result = await service.update(req.params.id as string, req.body.rating, req.user!.id_user);
    if (sendOwnershipError(res, result, "review not found", FORBIDDEN_MESSAGE)) return;
    return res.json({ message: "review updated", data: result.data });
};

/** Withdraws a review. Only the viewer who wrote it can do it. */
export const remove = async (req: Request, res: Response) => {
    const result = await service.remove(req.params.id as string, req.user!.id_user);
    if (sendOwnershipError(res, result, "review not found", FORBIDDEN_MESSAGE)) return;
    return res.sendStatus(204);
};
