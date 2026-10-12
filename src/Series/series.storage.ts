import { imageUpload } from "../Shared/database/content.Storage.js";

/** Multer setup for the optional series cover: one JPEG, PNG or WebP image. */
class SeriesStorage {
    download = imageUpload();
}

export default new SeriesStorage();
