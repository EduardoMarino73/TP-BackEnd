import { Request } from "express";
import  fs  from "fs";
import path from "path"

/**the path where save movies */
const moviePath = "movies";
export const BASE_PATH = "src\\Shared\\database\\content";

export const movieTitle = (req:Request,file:string): string => {
    const data = req.body.data ? JSON.parse(req.body.data) : {};
    return data.title + path.extname(file);
}

export const setMoviePath = (req:Request) => {
    /**set the movie directory for save the files */
    const movieDir = path.resolve(BASE_PATH,moviePath);

    /**id the directory or the path not exist this code create it */
    if(!fs.existsSync){
        fs.mkdirSync(movieDir, {recursive: true});
    }
    return movieDir;
}

export const getMoviePath = (filePath:string) => {
    const movieDir = path.resolve(BASE_PATH,moviePath)
    return path.resolve(movieDir,filePath);
}
