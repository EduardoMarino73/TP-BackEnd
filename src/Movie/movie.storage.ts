import multer from "multer";
import { moviePath, movieFileName } from "../Shared/database/content.Storage.js";

class MovieStorage{
    storage = multer.diskStorage({
        destination: function(req,file,cb){
            cb(null,moviePath)
        },
        filename:function(req,file,cb){
            cb(null,movieFileName(req,file.originalname));
        }
    });

    download = multer({storage: this.storage});
}

export default new MovieStorage()