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


/*
MATERIAL ÚTIL PARA ENTENDER MEJOR LA FUNCIÓN streamMovie:
fs Module: https://www.youtube.com/watch?v=Z_p1yFGS0Ak
Streams: https://www.youtube.com/watch?v=qnzC6vpBuxw
Pipes: https://www.youtube.com/watch?v=ej79ByltLOI
*/
export async function streamMovie(req: Request, res: Response) {
    const movieId = Number(req.params.id);

    if (!Number.isInteger(movieId) || movieId < 1) {
        return res.status(400).json({ message: "invalid movie id" });
    }

// busca la pelicula en la base de datos por id
    const movie = await service.findOne(movieId.toString()); 
    if (!movie) {
        return res.status(404).json({ message: "movie not found" });
    }

    // movie.path se guarda como "/movies/167123-xyz.mp4"
    // lo convierte a la ubicación real del archivo en el disco
    const fileName = path.basename(movie.path);
    const filePath = path.resolve("src/Shared/database/content/movies", fileName);

    //intenta leer los metadatos del archivo de forma sincrona. Si el archivo se borró o no existe en esa ruta, agarra la excepción y devuelve un 404
    let stat: fs.Stats;
    try {
        stat = fs.statSync(filePath);
    } catch {
        return res.status(404).json({ message: "video file not found on disk" });
    }


    const fileSize = stat.size; // guarda el tamaño total del archivo en bytes
    const range = req.headers.range; //lee la cabecera HTTPRange que envia el navegador (en bytes)

    // si el navegador no especifica un RANGE: enviamos todo (es raro que pase)
    if (!range) {
        res.writeHead(200, { // 200 es el codigo de ok
            "Content-Length": fileSize, //informamos el tamaño total
            "Content-Type": "video/mp4", //el tipo de archivo
            "Accept-Ranges": "bytes", //informamos que aceptamos peticiones por rango de bytes
        });
        fs.createReadStream(filePath).pipe(res); //crea un stream de lectura del archivo con .createReadStream(filePath) y lo envia al navegador .pipe(res)
        return;
    }

    // Parse "bytes=START-END"
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per chunk as a cap
    const [startStr, endStr] = range.replace(/bytes=/, "") //saca el prefijo "bytes=", dejando "1000-2000".
    .split("-");  // separa en ["1000", "2000"].
    const start = parseInt(startStr, 10); //el byte de donde empezamos
    const end = endStr 
        ? Math.min(parseInt(endStr, 10), fileSize - 1) //si el navegador especifico un final (endStr existe), usamos ese, pero nunca mas lejos del tamaño real del archivo (Math.min(..., fileSize - 1))
        : Math.min(start + CHUNK_SIZE, fileSize - 1); //si no especificó final, nosotros ponemos un tope de CHUNK_SIZE (5MB) para no mandar de más de una, así forzamos que el video se transmita en pedazos manejables en vez de mandar "desde el byte 1000 hasta el final" de un solo golpe

    // si alguien pide un rango absurdo (tipo "bytes=1000000000-1000000001" cuando el archivo tiene 10MB), devolvemos un 416 (range not satisfiable)
    if (start >= fileSize || start > end) {
        res.writeHead(416, { "Content-Range": `bytes */${fileSize}` });
        return res.end();
    }

    const contentLength = end - start + 1;

    res.writeHead(206, {  // 206 (Partial Content) es el código HTTP que le dice al navegador "esto que te mando NO es el archivo completo, es un pedazo". Es distinto de 200, y es lo que le permite al <video> entender que puede seguir pidiendo más pedazos
        "Content-Range": `bytes ${start}-${end}/${fileSize}`, //le decimos al navegador qué pedazo le estamos mandando en relación al tamaño total del archivo
        "Accept-Ranges": "bytes", //le decimos que aceptamos peticiones por rango de bytes
        "Content-Length": contentLength, //el tamaño de este pedazo (no del archivo completo)
        "Content-Type": "video/mp4", 
    });

    const stream = fs.createReadStream(filePath, { start, end }); //aca la diferencia clave con el "fs.createRedStream" anterior es que le pasamos start y end para que Node lea solo esa porción del archivo del disco. O sea node abre el archivo, se salta el byte hasta "start" y va leyendo hasta "end", y lo va enviando al navegador a medida que lo lee.Esto hace que el video se transmita en pedazos y no se tenga que cargar todo de golpe.
    stream.pipe(res);

    //si algo sale mal mientras se lee el archivo, cerramos la coonexion con el cliente en vez de dejada colgada esperando algo que nunca va a llegar
    stream.on("error", () => {
        res.destroy();
    });
}
