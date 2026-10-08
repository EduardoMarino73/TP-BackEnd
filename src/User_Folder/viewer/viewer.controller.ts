import { NextFunction, Request, Response } from "express";
import { ViewerService } from "./viewer.service.js";

const service = new ViewerService();

/** Returns the authenticated viewer's profile and engagement summary. */
export function viewerProfile(req: Request, res: Response, next: NextFunction) {
    void service.findProfile(req.user!.id_user).then((viewer) => {
        if (!viewer) return res.status(404).json({ message: "Viewer not found" });
        return res.json({ data: viewer });
    }).catch(next);
}
