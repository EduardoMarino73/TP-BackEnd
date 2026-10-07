import { Router } from "express";
import { findAll, findOne, findBySeason, create, update, remove, streamEpisode } from "./episode.controller.js";
import { sanitizeEpisodeInput } from "./episode.validation.js";
import episodeStorage from "./episode.storage.js";

export const episodeRouter = Router();

episodeRouter.get("/", findAll);
episodeRouter.get("/:id/stream", streamEpisode);
episodeRouter.get("/season/:seasonId", findBySeason);
episodeRouter.get("/:id", findOne);
episodeRouter.post("/", episodeStorage.download.single("archivo"), sanitizeEpisodeInput, create);
episodeRouter.put("/:id", sanitizeEpisodeInput, update);
episodeRouter.patch("/:id", sanitizeEpisodeInput, update);
episodeRouter.delete("/:id", remove);
