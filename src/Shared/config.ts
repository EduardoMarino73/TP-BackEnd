import "dotenv/config";
import path from "path";

/** Reads a positive number from the environment, or returns the fallback. */
function readNumber(name: string, fallback: number): number {
    const value = Number(process.env[name]);
    return Number.isFinite(value) && value > 0 ? value : fallback;
}

/** Reads a comma-separated list from the environment. */
function readList(name: string): string[] {
    return (process.env[name] ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

/**
 * Every setting the server needs, taken from .env (see .env.example).
 * The database settings are read by Shared/database/connections.ts.
 */
export const config = {
    port: readNumber("PORT", 3000),
    // Origins allowed by CORS. Empty means any origin (useful only in development).
    corsOrigins: readList("CORS_ORIGIN"),
    // Folder where uploaded videos and images are stored.
    contentDir: path.resolve(process.env.CONTENT_DIR ?? "src/Shared/database/content"),
    maxVideoSizeMb: readNumber("MAX_VIDEO_SIZE_MB", 500),
    maxImageSizeMb: readNumber("MAX_IMAGE_SIZE_MB", 5),
};
