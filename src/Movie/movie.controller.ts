import { Request, Response } from "express";
import { MovieRepository } from "./movie.repository.js";
import { MovieService } from "./movie.service.js";
import fs from "fs";
import path from "path";

/*El controlador se va a encargar de manejar la logica del negocio que me permite armar un paquete
con toda la informacion que voy a tener que devolver al FrontEnd */

const service = new MovieService(new MovieRepository());

export const findAll = async (req:Request,res:Response) =>{
   res.json(await service.findAll());
}

export const findOne = async (req:Request,res:Response) =>{
    /*take the id param from the URL and send this to movie.service*/
    const id_Movie = req.params.id as string;
    const movie = await service.findOne(id_Movie);

    if(!movie){
        return res.sendStatus(404).send({message: "movie not found"});
    }
    return res.send({movie});
}

export const create = async (req:Request,res:Response) =>{
    /** log check if anything is wrong */
    const movieInput = req.body.sanitizeMovieInput;

    if (req.file) {
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
    /* "req.body.sanitizeMovieInput" is a callback that clear all the undefined params of my movie object */
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


export async function streamMovie(req: Request, res: Response) {
    const movieId = Number(req.params.id);

    if (!Number.isInteger(movieId) || movieId < 1) {
        return res.status(400).json({ message: "invalid movie id" });
    }

    const movie = await service.findOne(movieId.toString());
    if (!movie) {
        return res.status(404).json({ message: "movie not found" });
    }

    // movie.path is stored like "/movies/167123-xyz.mp4"
    // convert it to the real file location on disk
    const fileName = path.basename(movie.path);
    const filePath = path.resolve("src/Shared/database/content/movies", fileName);

    let stat: fs.Stats;
    try {
        stat = fs.statSync(filePath);
    } catch {
        return res.status(404).json({ message: "video file not found on disk" });
    }

    const fileSize = stat.size;
    const range = req.headers.range;

    // No range header: browser is just probing, send everything (rare case)
    if (!range) {
        res.writeHead(200, {
            "Content-Length": fileSize,
            "Content-Type": "video/mp4",
            "Accept-Ranges": "bytes",
        });
        fs.createReadStream(filePath).pipe(res);
        return;
    }

    // Parse "bytes=START-END"
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per chunk as a cap
    const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
    const start = parseInt(startStr, 10);
    const end = endStr
        ? Math.min(parseInt(endStr, 10), fileSize - 1)
        : Math.min(start + CHUNK_SIZE, fileSize - 1);

    if (start >= fileSize || start > end) {
        res.writeHead(416, { "Content-Range": `bytes */${fileSize}` });
        return res.end();
    }

    const contentLength = end - start + 1;

    res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    });

    const stream = fs.createReadStream(filePath, { start, end });
    stream.pipe(res);

    stream.on("error", () => {
        res.destroy();
    });
}
