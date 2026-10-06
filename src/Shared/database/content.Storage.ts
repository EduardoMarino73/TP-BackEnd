import { Request } from "express";
import  fs  from "fs";
import path from "path"

/**the path where save movies */
export const BASE_PATH = path.resolve("src", "Shared", "database", "content");
export const moviePath = path.join(BASE_PATH, "movies");
export const episodePath = path.join(BASE_PATH, "series");
 
// create the folders if dont exist
[moviePath, episodePath].forEach((dir) => {
    fs.mkdirSync(dir, { recursive: true });
});


/** Builds a safe filename from the title sent in req.body.data, keeping the original file extension only once */
const buildFileName = (req:Request, file:string): string => {
    const data = req.body.data ? JSON.parse(req.body.data) : {};
    const ext = path.extname(file).toLowerCase();
    let title = String(data.title ?? path.basename(file, path.extname(file))).trim();

    // if the title already ends with the extension (e.g. "title.mp4") remove it to avoid "title.mp4.mp4"
    if (ext && title.toLowerCase().endsWith(ext)) {
        title = title.slice(0, -ext.length);
    }

    // replace characters that are invalid in filenames or break URLs (spaces, / \ : * ? " < > | # %)
    title = title.replace(/[\\/:*?"<>|#%]/g, "").replace(/\s+/g, "_");

    return title + ext;
}

export const movieTitle = (req:Request,file:string): string => buildFileName(req, file);

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
export const episodeTitle = (req: Request, file: string): string => buildFileName(req, file);

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
