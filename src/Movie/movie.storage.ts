import { moviePath, videoUpload } from "../Shared/database/content.Storage.js";

/** Multer setup for movie uploads: unique names, size limit and video files only. */
class MovieStorage{
    download = videoUpload(moviePath);
}

export default new MovieStorage()
