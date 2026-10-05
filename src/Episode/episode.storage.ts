import multer from "multer";
import { episodeTitle, setEpisodePath } from "../Shared/database/content.Storage.js";

/**
 * Storage configuration for Episode video uploads using Multer.
 * Stores episode videos inside the dedicated 'src/Shared/database/content/series' directory.
 */
class EpisodeStorage {
    // Disk storage engine allows full control over file destination and naming
    storage = multer.diskStorage({
        destination: function (req, _file, cb) {
            cb(null, setEpisodePath(req));
        },
        filename: function (req, file, cb) {
            cb(null, episodeTitle(req, file.originalname));
        }
    });

    // Multer instance for handling single multipart video uploads
    download = multer({ storage: this.storage });
}

export default new EpisodeStorage();
