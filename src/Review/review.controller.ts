import { Request, Response } from "express";
import { ReviewRepository } from "./review.repository.js";

const repositorio = new ReviewRepository()

function findAll(req:Request,res:Response){
    res.json({data:repositorio.findAll()})
}

export {findAll}