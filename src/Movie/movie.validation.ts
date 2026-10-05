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

    // when it comes WITH a video file (e.g. in UploadPage): the JSON travels as a string inside req.body.data
    // when it comes WITHOUT a video file (e.g. in MyVideosPage): req.body already carries the fields directly
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
