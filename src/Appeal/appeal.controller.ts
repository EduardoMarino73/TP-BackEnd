import { Request, Response } from "express";
import { AppealRepository } from "./appeal.repository.js";

const repositorio = new AppealRepository()

function findAll(req:Request,res:Response){
    res.json({data:repositorio.findAll()})
}

export {findAll}