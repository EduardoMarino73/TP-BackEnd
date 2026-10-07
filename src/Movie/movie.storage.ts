import multer from "multer";
import { movieTitle, setMoviePath } from "../Shared/database/content.Storage.js";

class MovieStorage{
    storage = multer.diskStorage({
        destination: function(req,file,cb){
            cb(null,setMoviePath(req))
        },
        filename:function(req,file,cb){
            cb(null,movieTitle(req,file.originalname));
        }
    });

    download = multer({storage: this.storage});
}

export default new MovieStorage()