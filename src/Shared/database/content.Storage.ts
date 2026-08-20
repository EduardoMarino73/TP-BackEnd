import { Request } from "express";
import path from "path"

/**the path where save movies */
export const moviePath = "src\\Shared\\database\\content\\movies";
export const BASE_PATH = "src\\Shared\\database\\content";

export const movieTitle = (req:Request,file:string): string => {
    const data = req.body.data ? JSON.parse(req.body.data) : {};
    return data.title + path.extname(file)
}

export const movieFileName = (req: Request, file: string): string => {
    const ext = path.extname(file);
    return `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
};

