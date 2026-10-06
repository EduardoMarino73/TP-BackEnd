import { NextFunction, Request, Response } from "express";

export const sanitizeMovieInput = (req:Request, res:Response,next:NextFunction) => {

    // cuando viene CON archivo de video (porejemplo en UploadPage): el JSON viaja como string adentro de req.body.data
    // cuando viene SIN archivo de video (por ejem en MisVideosPage): req.body ya trae los campos directamente
    const data = req.body.data ? JSON.parse(req.body.data) : req.body;

    req.body.sanitizeMovieInput = {
        id_author: data.id_author,
        title: data.title,
        category: data.category,
        views: data.views,
        description: data.description,
        report: data.report,
        state: data.state
    }

    /*this remove all undefined params, it works as a partial update */
    Object.keys(req.body.sanitizeMovieInput).forEach((key) => {
        if (req.body.sanitizeMovieInput[key] === undefined) {
            delete req.body.sanitizeMovieInput[key];
        }
    })

    next()

}
