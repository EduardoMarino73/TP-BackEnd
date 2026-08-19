import multer from "multer";
import { moviePath, movieTitle } from "../Shared/database/content.Storage.js";

class MovieStorage{
    storage = multer.diskStorage({
        destination: function(req,file,cb){
            cb(null,moviePath)
        },
        filename:function(req,file,cb){
            /**originalname is the name in the uploader´s PC */
            cb(null,movieTitle(req,file.originalname));
        }
    });

    download = multer({storage: this.storage});
}

export default new MovieStorage()