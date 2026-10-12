import { Request, Response } from "express";
import { sendOwnershipError } from "../Shared/ownership.js";
import { WatchLaterService } from "./watch_later.service.js";

const service = new WatchLaterService();

/** GET /api/watch-later: the signed-in viewer's list. */
export const list = async (req: Request, res: Response) => {
    return res.json({ data: await service.list(req.user!.id_user) });
};

/** POST /api/watch-later: saves a movie or series for later. */
export const add = async (req: Request, res: Response) => {
    const { audiovisualId, audiovisualType } = req.body;
    try {
        const item = await service.add(req.user!.id_user, audiovisualId, audiovisualType);
        if (!item) return res.status(404).json({ message: "audiovisual not found" });
        return res.status(201).json({ data: item });
    } catch (error) {
        if ((error as { code?: string }).code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "It is already in your Watch later list" });
        }
        throw error;
    }
};

/** DELETE /api/watch-later/:id: removes an item from the viewer's own list. */
export const remove = async (req: Request, res: Response) => {
    const result = await service.remove(Number(req.params.id), req.user!.id_user);
    if (sendOwnershipError(res, result, "Watch later item not found", "That item is not in your list")) return;
    return res.sendStatus(204);
};
