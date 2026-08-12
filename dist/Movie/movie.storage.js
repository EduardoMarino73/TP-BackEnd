import multer from "multer";
class MovieStorage {
    constructor() {
        this.storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, 'src\\Shared\\database\\content\\movies');
            },
            filename: function (req, file, cb) {
                /**originalname is the name in the uploader´s PC */
                cb(null, file.originalname);
            }
        });
        this.download = multer({ storage: this.storage });
    }
}
export default new MovieStorage();
//# sourceMappingURL=movie.storage.js.map