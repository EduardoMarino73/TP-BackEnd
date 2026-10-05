import { Request } from "express";
import  fs  from "fs";
import path from "path"

/**the path where save movies */
const moviePath = "movies";
const episodePath = "series";
export const BASE_PATH = "src\\Shared\\database\\content";

export const movieTitle = (req:Request,file:string): string => {
    const data = req.body.data ? JSON.parse(req.body.data) : {};
    return data.title + path.extname(file);
}

export const setMoviePath = (req:Request) => {
    /**set the movie directory for save the files */
    const movieDir = path.resolve(BASE_PATH,moviePath);

    /**id the directory or the path not exist this code create it */
    if(!fs.existsSync(movieDir)){
        fs.mkdirSync(movieDir, {recursive: true});
    }
    return movieDir;
}

/** Returns the filename used to store an uploaded episode video. */
export const episodeTitle = (req: Request, file: string): string => {
    const data = req.body.data ? JSON.parse(req.body.data) : {};
    return data.title + path.extname(file);
}

/** Creates and returns the directory used to store episode videos. */
export const setEpisodePath = (_req: Request) => {
    const episodeDir = path.resolve(BASE_PATH, episodePath);
    if (!fs.existsSync(episodeDir)) {
        fs.mkdirSync(episodeDir, { recursive: true });
    }
    return episodeDir;
}

export const getMoviePath = (filePath:string) => {
    const movieDir = path.resolve(BASE_PATH,moviePath)
    return path.resolve(movieDir,filePath);
}
