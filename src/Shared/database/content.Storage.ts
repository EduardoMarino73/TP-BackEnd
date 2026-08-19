import { Request } from "express";
import path from "path"

/**the path where save movies */
export const moviePath = "\\movies";
export const BASE_PATH = "src\\Shared\\database\\content";

export const movieTitle = (req:Request,file:string): string => {
    const data = req.body.data ? JSON.parse(req.body.data) : {};
    return data.title + path.extname(file)
}

export const getMoviePath = (filePath:string) => {
    const movieDir = path.resolve(BASE_PATH,moviePath)
    return path.resolve(movieDir,filePath);
}