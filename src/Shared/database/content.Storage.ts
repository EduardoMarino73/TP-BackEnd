import { Request } from "express";
import path from "path"

/**the path where save movies */
export const moviePath = "src\\Shared\\database\\content\\movies";
export const BASE_PATH = "src\\Shared\\database\\content";

export const movieTitle = (req:Request,file:string): string => {
    return req.body.tittle + path.extname(file)
}

