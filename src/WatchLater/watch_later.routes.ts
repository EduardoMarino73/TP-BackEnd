import { Router } from "express";
import { authenticate, requireRole } from "../User_Folder/user.auth.js";
import { add, list, remove } from "./watch_later.controller.js";
import { validateWatchLaterInput } from "./watch_later.validation.js";

/** /api/watch-later: each signed-in viewer manages only their own list. */
export const watchLaterRouter = Router();

watchLaterRouter.use(authenticate, requireRole("viewer"));
watchLaterRouter.get("/", list);
watchLaterRouter.post("/", validateWatchLaterInput, add);
watchLaterRouter.delete("/:id", remove);
