import { Request } from "express";
import path from "path"
import fs from "fs"

/**the path where save movies */
export const BASE_PATH = path.resolve("src", "Shared", "database", "content");
export const moviePath = path.join(BASE_PATH, "movies");
export const seriesPath = path.join(BASE_PATH, "series");
 
// create the folders if dont exist
[moviePath, seriesPath].forEach((dir) => {
    fs.mkdirSync(dir, { recursive: true });
});


export const movieTitle = (req:Request,file:string): string => {
    const data = req.body.data ? JSON.parse(req.body.data) : {};
    return data.title + path.extname(file)
}

export const movieFileName = (req: Request, file: string): string => {
    const ext = path.extname(file);
    return `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
};

