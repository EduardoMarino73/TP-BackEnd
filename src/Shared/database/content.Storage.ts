import { randomBytes } from "crypto";
import  fs  from "fs";
import path from "path"
import multer from "multer";
import { config } from "../config.js";

/** Folder where uploaded content is saved (CONTENT_DIR in .env). */
export const BASE_PATH = config.contentDir;
export const moviePath = path.join(BASE_PATH, "movies");
export const episodePath = path.join(BASE_PATH, "series");

// create the folders if dont exist
[moviePath, episodePath].forEach((dir) => {
    fs.mkdirSync(dir, { recursive: true });
});

const MEGABYTE = 1024 * 1024;

/**
 * A unique name for every stored file ("1760300000000-3f9a1c2b4d5e.mp4"), so two uploads
 * with the same title never overwrite each other. Only a short alphanumeric extension is kept.
 */
export const uniqueFileName = (originalName: string): string => {
    const ext = path.extname(originalName).toLowerCase();
    const safeExt = /^\.[a-z0-9]{1,5}$/.test(ext) ? ext : "";
    return `${Date.now()}-${randomBytes(6).toString("hex")}${safeExt}`;
}

/** An error the JSON error handler answers with its own status code. */
export const uploadError = (status: number, message: string) => Object.assign(new Error(message), { status });

/**
 * Multer middleware factory for video uploads: unique file names, a size limit
 * (MAX_VIDEO_SIZE_MB) and only files whose type is video/*.
 */
export const videoUpload = (folder: string) => multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, folder),
        filename: (_req, file, cb) => cb(null, uniqueFileName(file.originalname)),
    }),
    limits: { fileSize: config.maxVideoSizeMb * MEGABYTE },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith("video/")) return cb(null, true);
        return cb(uploadError(415, "Only video files can be uploaded"));
    },
});

export const getMoviePath = (filePath:string) => {
    const movieDir = path.resolve(BASE_PATH,moviePath)
    return path.resolve(movieDir,filePath);
}
