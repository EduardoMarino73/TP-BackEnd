import { NextFunction, Request, Response } from "express";

export const sanitizeMovieInput = (req:Request, res:Response,next:NextFunction) => {
    /**if true parse the Json, else data is an empty object */
    const data = req.body.data ? JSON.parse(req.body.data) : {};

    req.body.sanitizeMovieInput = {
        id_author: data.id_author,
        path: "",
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
