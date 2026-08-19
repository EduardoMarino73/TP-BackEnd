import { NextFunction, Request, Response } from "express";
import { movieTitle } from "../Shared/database/content.Storage.js";

export const sanitizeMoviePathInput = (req:Request,res:Response,next:NextFunction) => {
    const data = req.body.data ? JSON.parse(req.body.data) : {};

    req.body.sanitizeMoviePathInput = {
        path: data.path
    }

    if(req.body.sanitizeMoviePathInput.path === undefined) {
        delete req.body.sanitizeMoviePathInput.path;
    }

    next()
}

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
