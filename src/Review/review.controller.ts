import { Request, Response } from "express";
import { ReviewRepository } from "./review.repository.js";

const repository = new ReviewRepository()

function findAll(req:Request,res:Response){
    res.json({data:repository.findAll()})
}

export {findAll}
