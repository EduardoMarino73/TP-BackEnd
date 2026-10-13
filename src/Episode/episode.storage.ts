import { episodePath, videoUpload } from "../Shared/database/content.Storage.js";

/**
 * Storage configuration for Episode video uploads using Multer.
 * Stores episode videos inside the 'series' folder of CONTENT_DIR, with unique names,
 * a size limit and video files only.
 */
class EpisodeStorage {
    // Multer instance for handling single multipart video uploads
    download = videoUpload(episodePath);
}

export default new EpisodeStorage();
