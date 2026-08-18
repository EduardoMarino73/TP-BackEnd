import multer from "multer";
import { moviePath, movieTittle } from "../Shared/database/content/content.Storage.js";
class MovieStorage {
    constructor() {
        this.storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, moviePath);
            },
            filename: function (req, file, cb) {
                /**originalname is the name in the uploader´s PC */
                cb(null, movieTittle(req, file.originalname));
            }
        });
        this.download = multer({ storage: this.storage });
    }
}
export default new MovieStorage();
//# sourceMappingURL=movie.storage.js.map