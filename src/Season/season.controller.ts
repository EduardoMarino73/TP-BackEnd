import { Request, Response } from "express";
import { SeasonRepository } from "./season.repository.js";


const repository = new SeasonRepository()

function findAll(req:Request,res:Response){
    res.json({data:repository.findAll()})
}

export {findAll}
