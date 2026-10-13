import { Router } from "express";
import { findAll, findOne, findBySeason, create, update, remove, streamEpisode } from "./episode.controller.js";
import { sanitizeEpisodeInput, sanitizeEpisodeUpdate } from "./episode.validation.js";
import { authenticate, requireRole } from "../User_Folder/user.auth.js";
import episodeStorage from "./episode.storage.js";
import { requestContext } from "../Shared/database/request-context.js";

export const episodeRouter = Router();

episodeRouter.get("/", findAll);
episodeRouter.get("/:id/stream", streamEpisode);
episodeRouter.get("/season/:seasonId", findBySeason);
episodeRouter.get("/:id", findOne);
// Writing requires a token. The token is checked before multer, so anonymous uploads never reach the disk.
// "archivo" is the video and the optional "thumbnail" an image captured by the frontend.
// requestContext runs again after multer, which loses the ORM's request context.
episodeRouter.post("/", authenticate, requireRole("viewer"), episodeStorage.download.fields([{ name: "archivo", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]), requestContext, sanitizeEpisodeInput, create);
episodeRouter.put("/:id", authenticate, sanitizeEpisodeUpdate, update);
episodeRouter.patch("/:id", authenticate, sanitizeEpisodeUpdate, update);
episodeRouter.delete("/:id", authenticate, remove);
