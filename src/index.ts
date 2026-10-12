import express, { NextFunction, Request, Response } from "express";
import { movieRouter } from "./Movie/movie.routes.js";
import { seriesRouter } from "./Series/series.routes.js";
import { seasonRouter } from "./Season/season.routes.js";
import { episodeRouter } from "./Episode/episode.routes.js";
import cors from "cors";
import path from "path";
import multer from "multer";
import { reviewRouter } from "./Review/review.routes.js";
import { userRouter } from "./User_Folder/user.routes.js";
import { viewerRouter } from "./User_Folder/viewer/viewer.routes.js";
import { administratorRouter } from "./User_Folder/administrator/administrator.routes.js";
import { complaintRouter } from "./Report/complaint.routes.js";
import { appealRouter } from "./Appeal/appeal.routes.js";
import { db } from "./Shared/database/connections.js";
import { episodePath, moviePath } from "./Shared/database/content.Storage.js";
import { config } from "./Shared/config.js";
import { RowDataPacket } from "mysql2";

//start the server
const app = express()
// Only the frontend origins listed in CORS_ORIGIN may call the API (any origin when it is empty).
app.use(cors(config.corsOrigins.length > 0 ? { origin: config.corsOrigins } : undefined));

// Parse incoming requests with JSON payloads
app.use(express.json());

// Serve only media files that still belong to active content records.
app.use("/movies", async (req, res, next) => {
    try {
        const mediaPath = `/movies/${path.basename(req.path)}`;
        const [rows] = await db.execute<(RowDataPacket & { id: number })[]>(
            "SELECT id FROM movies WHERE path = ? AND state = 'active' LIMIT 1",
            [mediaPath],
        );
        if (rows.length === 0) return res.sendStatus(404);
        return next();
    } catch (error) {
        return next(error);
    }
}, express.static(moviePath));

app.use("/series", async (req, res, next) => {
    try {
        const mediaPath = `/series/${path.basename(req.path)}`;
        const [rows] = await db.execute<(RowDataPacket & { id: number })[]>(
            `SELECT e.id
             FROM episodes AS e
             JOIN seasons AS s ON s.id = e.id_season
             JOIN series AS parent ON parent.id = s.id_serie
             WHERE e.path = ?
               AND e.state = 'active'
               AND parent.state = 'active'
             LIMIT 1`,
            [mediaPath],
        );
        if (rows.length === 0) return res.sendStatus(404);
        return next();
    } catch (error) {
        return next(error);
    }
}, express.static(episodePath));

// Register REST API routers
app.use("/api/movie", movieRouter);
app.use("/api/series", seriesRouter);
app.use("/api/seasons", seasonRouter);
app.use("/api/episodes", episodeRouter);
// Exposes review operations under /api/reviews.
app.use("/api/reviews", reviewRouter);
app.use("/api/users", userRouter);
app.use("/api/viewers", viewerRouter);
app.use("/api/administrators", administratorRouter);
app.use("/api/reports", complaintRouter);
app.use("/api/appeals", appealRouter);

// Fallback 404 handler for unrecognized routes
app.use((_, res) => {
    return res.status(404).send({ message: "source not found " });
});

/**
 * Turns every error into a JSON { message } with the right status code.
 * Express 5 also sends here the errors thrown by async controllers.
 */
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({ message: "The file is too large" });
        }
        return res.status(400).json({ message: `Invalid upload: ${error.message}` });
    }
    // body-parser errors (invalid JSON...) and upload filter errors carry their own 4xx status
    const { status, message, type } = error as { status?: unknown; message?: unknown; type?: unknown };
    if (type === "entity.parse.failed") {
        return res.status(400).json({ message: "The request body is not valid JSON" });
    }
    if (typeof status === "number" && status >= 400 && status < 500) {
        return res.status(status).json({
            message: typeof message === "string" ? message : "Invalid request",
        });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
});

// Start listening for HTTP connections
app.listen(config.port, () => {
    console.log(`Server listening at port: ${config.port}`);
});
