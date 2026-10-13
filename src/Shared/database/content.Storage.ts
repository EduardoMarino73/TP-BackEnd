import { randomBytes } from "crypto";
import { Request } from "express";
import  fs  from "fs";
import path from "path"
import multer from "multer";
import { config } from "../config.js";

/** Folder where uploaded content is saved (CONTENT_DIR in .env). */
export const BASE_PATH = config.contentDir;
export const moviePath = path.join(BASE_PATH, "movies");
export const episodePath = path.join(BASE_PATH, "series");
// thumbnails of movies and episodes, and series covers
export const thumbnailPath = path.join(BASE_PATH, "thumbnails");

// create the folders if dont exist
[moviePath, episodePath, thumbnailPath].forEach((dir) => {
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

/** Image types accepted for thumbnails and covers. */
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
/** Name of the multipart field that carries a thumbnail or a cover. */
export const THUMBNAIL_FIELD = "thumbnail";
export const MAX_IMAGE_BYTES = config.maxImageSizeMb * MEGABYTE;

const acceptImage = (mimetype: string) => IMAGE_TYPES.includes(mimetype);
const IMAGE_TYPE_ERROR = "Thumbnails must be JPEG, PNG or WebP images";

/**
 * Multer middleware factory for video uploads: unique file names, a size limit
 * (MAX_VIDEO_SIZE_MB) and only files whose type is video/*.
 * An optional image in the "thumbnail" field goes to the thumbnails folder.
 */
export const videoUpload = (folder: string) => multer({
    storage: multer.diskStorage({
        destination: (_req, file, cb) => cb(null, file.fieldname === THUMBNAIL_FIELD ? thumbnailPath : folder),
        filename: (_req, file, cb) => cb(null, uniqueFileName(file.originalname)),
    }),
    // multer applies one limit to every file; the thumbnail's own limit is checked by the validation
    limits: { fileSize: config.maxVideoSizeMb * MEGABYTE },
    fileFilter: (_req, file, cb) => {
        if (file.fieldname === THUMBNAIL_FIELD) {
            return acceptImage(file.mimetype) ? cb(null, true) : cb(uploadError(415, IMAGE_TYPE_ERROR));
        }
        if (file.mimetype.startsWith("video/")) return cb(null, true);
        return cb(uploadError(415, "Only video files can be uploaded"));
    },
});

/** Multer middleware factory for a single image (a series cover), up to MAX_IMAGE_SIZE_MB. */
export const imageUpload = () => multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, thumbnailPath),
        filename: (_req, file, cb) => cb(null, uniqueFileName(file.originalname)),
    }),
    limits: { fileSize: MAX_IMAGE_BYTES },
    fileFilter: (_req, file, cb) => (
        acceptImage(file.mimetype) ? cb(null, true) : cb(uploadError(415, IMAGE_TYPE_ERROR))
    ),
});

/** The file multer saved for a field, whether the route used single() or fields(). */
export const uploadedFile = (req: Request, field: string): Express.Multer.File | undefined => {
    if (req.file?.fieldname === field) return req.file;
    if (req.files && !Array.isArray(req.files)) return req.files[field]?.[0];
    return undefined;
};

/** Public URL path of a stored thumbnail, or null when none was uploaded. */
export const thumbnailUrl = (file: Express.Multer.File | undefined): string | null => (
    file ? `/thumbnails/${file.filename}` : null
);

/** True when the uploaded thumbnail is over MAX_IMAGE_SIZE_MB. */
export const thumbnailTooLarge = (req: Request): boolean => {
    const thumbnail = uploadedFile(req, THUMBNAIL_FIELD);
    return thumbnail !== undefined && thumbnail.size > MAX_IMAGE_BYTES;
};

export const getMoviePath = (filePath:string) => {
    const movieDir = path.resolve(BASE_PATH,moviePath)
    return path.resolve(movieDir,filePath);
}
