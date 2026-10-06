import { Request, Response } from "express";
import { MovieRepository } from "./movie.repository.js";
import { MovieService } from "./movie.service.js";
import fs from "fs";
import path from "path";

/*The controller takes care of handling the business logic that lets us put together a package
with all the information we need to return to the FrontEnd */

const service = new MovieService(new MovieRepository());

export const findAll = async (req:Request,res:Response) =>{
   res.json(await service.findAll());
}

export const findOne = async (req:Request,res:Response) =>{
    /*take the id param from the URL and send this to movie.service*/
    const id_Movie = req.params.id as string;
    const movie = await service.findOne(id_Movie);

    if(!movie){
        return res.sendStatus(404);
    }
    return res.send({movie});
}

export const findOneByPath = async (req:Request,res:Response) => {

    if(req.body.sanitizeMoviePathInput.path === undefined){
        res.send({message:"the path is undefined"})
    }

    const filePath = await service.findOneByPath(req.body.sanitizeMoviePathInput.path as string)
    return res.sendFile(filePath);
}

export const create = async (req:Request,res:Response) =>{
    /** log check if anything is wrong */
    const movieInput = req.body.sanitizeMovieInput;

    if (req.file) {
        // use the exact filename multer saved on disk, so the DB path always matches the real file
        movieInput.path = `/movies/${req.file.filename}`;
    }

    const requiredFields = ["id_author", "title", "views", "description", "state"] as const;
    const missingFields = requiredFields.filter((field) => movieInput[field] === undefined);

    if (missingFields.length > 0) {
        return res.status(400).json({
            message: "Missing required movie fields",
            fields: missingFields,
        });
    }

    const movie = await service.create(movieInput);
    return res.status(201).json({message: "movie created", data:movie});
}

export const update = async (req:Request,res:Response) =>{
    const id_Movie = req.params.id as string;
    /* "req.body.sanitizeMovieInput" is a callback that clears all the undefined params of my movie object */
    const movie = await service.update(id_Movie,req.body.sanitizeMovieInput);

    if(!movie){
        return res.sendStatus(404);
    }
    return res.status(200).send({message: "movie updated",data:movie});
}

export const remove = async (req:Request,res:Response) => {
    const id_Movie = req.params.id as string;
    const result = await service.remove(id_Movie);

    if(!result){
        return res.sendStatus(500).send({message: "internal error"});
    }
    return res.status(200).send({message: `movie with id: ${id_Movie} was removed`});
}


/*
USEFUL MATERIAL TO BETTER UNDERSTAND THE streamMovie FUNCTION:
fs Module: https://www.youtube.com/watch?v=Z_p1yFGS0Ak
Streams: https://www.youtube.com/watch?v=qnzC6vpBuxw
Pipes: https://www.youtube.com/watch?v=ej79ByltLOI
*/
export async function streamMovie(req: Request, res: Response) {
    const movieId = Number(req.params.id);

    if (!Number.isInteger(movieId) || movieId < 1) {
        return res.status(400).json({ message: "invalid movie id" });
    }

// look up the movie in the database by id
    const movie = await service.findOne(movieId.toString()); 
    if (!movie) {
        return res.status(404).json({ message: "movie not found" });
    }

    // movie.path is stored as "/movies/167123-xyz.mp4"
    // convert it to the file's actual location on disk
    const fileName = path.basename(movie.path);
    const filePath = path.resolve("src/Shared/database/content/movies", fileName);

    //try to read the file metadata synchronously. If the file was deleted or doesn't exist at that path, catch the exception and return a 404
    let stat: fs.Stats;
    try {
        stat = fs.statSync(filePath);
    } catch {
        return res.status(404).json({ message: "video file not found on disk" });
    }


    const fileSize = stat.size; // stores the total file size in bytes
    const range = req.headers.range; //reads the HTTP Range header sent by the browser (in bytes)

    // if the browser doesn't specify a RANGE: we send everything (this rarely happens)
    if (!range) {
        res.writeHead(200, { // 200 is the ok status code
            "Content-Length": fileSize, //report the total size
            "Content-Type": "video/mp4", //the file type
            "Accept-Ranges": "bytes", //let the client know we accept byte-range requests
        });
        fs.createReadStream(filePath).pipe(res); //create a read stream from the file with .createReadStream(filePath) and send it to the browser with .pipe(res)
        return;
    }

    // Parse "bytes=START-END"
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per chunk as a cap
    const [startStr, endStr] = range.replace(/bytes=/, "") //strip the "bytes=" prefix, leaving "1000-2000".
    .split("-");  // split into ["1000", "2000"].
    const start = parseInt(startStr, 10); //the byte we start from
    const end = endStr 
        ? Math.min(parseInt(endStr, 10), fileSize - 1) //if the browser specified an end (endStr exists), use it, but never further than the actual file size (Math.min(..., fileSize - 1))
        : Math.min(start + CHUNK_SIZE, fileSize - 1); //if no end was specified, we cap it at CHUNK_SIZE (5MB) so we don't send too much at once, forcing the video to stream in manageable pieces instead of sending "from byte 1000 to the end" all at once

    // if someone asks for an absurd range (e.g. "bytes=1000000000-1000000001" when the file is 10MB), we return a 416 (range not satisfiable)
    if (start >= fileSize || start > end) {
        res.writeHead(416, { "Content-Range": `bytes */${fileSize}` });
        return res.end();
    }

    const contentLength = end - start + 1;

    res.writeHead(206, {  // 206 (Partial Content) is the HTTP code that tells the browser "what I'm sending you is NOT the full file, it's a chunk". It's different from 200, and it's what lets the <video> element understand it can keep requesting more chunks
        "Content-Range": `bytes ${start}-${end}/${fileSize}`, //tell the browser which chunk we're sending relative to the total file size
        "Accept-Ranges": "bytes", //let it know we accept byte-range requests
        "Content-Length": contentLength, //the size of this chunk (not the whole file)
        "Content-Type": "video/mp4", 
    });

    const stream = fs.createReadStream(filePath, { start, end }); //the key difference from the earlier "fs.createReadStream" is that we pass start and end so Node reads only that portion of the file from disk. Node opens the file, skips ahead to "start" and reads through "end", sending it to the browser as it reads. This makes the video stream in chunks instead of having to be loaded all at once.
    stream.pipe(res);

    //if something goes wrong while reading the file, close the connection with the client instead of leaving it hanging waiting for something that will never arrive
    stream.on("error", () => {
        res.destroy();
    });
}
