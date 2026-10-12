import { Request, Response } from "express";
import { EpisodeRepository } from "./episode.repository.js";

import { EpisodeService } from "./episode.service.js";
import { sendOwnershipError } from "../Shared/ownership.js";
import { discardUploads } from "../Shared/validation.js";
import fs from "fs";
import path from "path";
import { episodePath } from "../Shared/database/content.Storage.js";

/**
 * Controller layer responsible for Episode endpoints, uploads, and video streaming.
 */
const service = new EpisodeService(new EpisodeRepository());

/**
 * GET /api/episodes
 * Returns all episodes.
 */
export const findAll = async (_req: Request, res: Response) => {
    const episodes = await service.findAll();
    return res.json(episodes);
};

/**
 * GET /api/episodes/:id
 * Fetches a single episode by its primary key ID.
 */
export const findOne = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const episode = await service.findOne(id);

    if (!episode) {
        return res.status(404).json({ message: "episode not found" });
    }
    return res.json({ episode });
};

/**
 * GET /api/episodes/season/:seasonId
 * Returns all episodes belonging to a specific season.
 */
export const findBySeason = async (req: Request, res: Response) => {
    const seasonId = req.params.seasonId as string;
    const episodes = await service.findBySeason(seasonId);
    return res.json(episodes);
};

/** MySQL error raised by the unique (season, episode number) key. */
const isDuplicate = (error: unknown) => (error as { code?: string }).code === "ER_DUP_ENTRY";
const DUPLICATE_MESSAGE = "That episode number already exists in this season";

/**
 * POST /api/episodes
 * Saves a new episode with its video file, in a season of a series the user uploaded.
 * If anything fails, the uploaded file is deleted.
 */
export const create = async (req: Request, res: Response) => {
    try {
        const result = await service.create({
            ...req.body.sanitizeEpisodeInput,
            // use the exact filename multer saved on disk
            path: `/series/${req.file!.filename}`,
            // the uploader is whoever owns the token, never a field of the request
            id_author: req.user!.id_user,
        });
        if ("error" in result) discardUploads(req);
        if (sendOwnershipError(res, result, "season not found")) return;
        return res.status(201).json({ message: "episode created", data: result.data });
    } catch (error) {
        discardUploads(req);
        if (isDuplicate(error)) return res.status(409).json({ message: DUPLICATE_MESSAGE });
        throw error;
    }
};

/**
 * PUT /api/episodes/:id or PATCH /api/episodes/:id
 * Updates the number, title or description of an episode.
 */
export const update = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    try {
        const result = await service.update(id, req.body.sanitizeEpisodeInput, req.user!.id_user);
        if (sendOwnershipError(res, result, "episode not found")) return;
        return res.status(200).json({ message: "episode updated", data: result.data });
    } catch (error) {
        if (isDuplicate(error)) return res.status(409).json({ message: DUPLICATE_MESSAGE });
        throw error;
    }
};

/**
 * DELETE /api/episodes/:id
 * Removes an episode from the platform.
 */
export const remove = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await service.remove(id, req.user!.id_user);

    if (sendOwnershipError(res, result, "episode not found")) return;
    return res.status(200).json({ message: `episode with id: ${id} was removed` });
};

/**
 * GET /api/episodes/:id/stream
 * Streams the episode video file in chunks using HTTP Range requests (HTTP 206 Partial Content).
 * This enables smooth playback, instant seeking, and minimal bandwidth consumption in HTML5 video players.
 */
export async function streamEpisode(req: Request, res: Response) {
    const episodeId = Number(req.params.id);

    // Validate that the ID is a positive integer
    if (!Number.isInteger(episodeId) || episodeId < 1) {
        return res.status(400).json({ message: "invalid episode id" });
    }

    // Look up the episode metadata in the database
    const episode = await service.findOne(episodeId.toString());
    if (!episode) {
        return res.status(404).json({ message: "episode not found" });
    }

    // Extract the filename from the path stored in the database (e.g. '/series/1723...mp4')
    const fileName = path.basename(episode.path);
    // Resolve the absolute path to the video file stored in the filesystem
    const filePath = path.resolve(episodePath, fileName);

    // Inspect file existence and metadata
    let stat: fs.Stats;
    try {
        stat = fs.statSync(filePath);
    } catch {
        return res.status(404).json({ message: "video file not found on disk" });
    }

    const fileSize = stat.size;
    const range = req.headers.range;

    // If no HTTP Range header was provided by the client, stream the entire file with 200 OK
    if (!range) {
        res.writeHead(200, {
            "Content-Length": fileSize,
            "Content-Type": "video/mp4",
            "Accept-Ranges": "bytes",
        });
        fs.createReadStream(filePath).pipe(res);
        return;
    }

    // Cap chunk size at 5MB to stream manageable video slices
    const CHUNK_SIZE = 5 * 1024 * 1024;
    // Parse "bytes=START-END"
    const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
    const start = parseInt(startStr, 10);
    const end = endStr
        ? Math.min(parseInt(endStr, 10), fileSize - 1)
        : Math.min(start + CHUNK_SIZE, fileSize - 1);

    // If requested byte range is invalid or exceeds total file size, respond with 416 Range Not Satisfiable
    if (start >= fileSize || start > end) {
        res.writeHead(416, { "Content-Range": `bytes */${fileSize}` });
        return res.end();
    }

    const contentLength = end - start + 1;

    // Send HTTP 206 Partial Content header informing client of the byte range being transmitted
    res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    });

    // Create a read stream starting at byte 'start' and ending at byte 'end'
    const stream = fs.createReadStream(filePath, { start, end });
    stream.pipe(res);

    // Terminate response connection gracefully on stream errors
    stream.on("error", () => {
        res.destroy();
    });
}
