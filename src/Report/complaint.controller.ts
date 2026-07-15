import { Request, Response } from "express";
import { ComplaintRepository } from "./complaint.repository.js";

const repositorio = new ComplaintRepository()

function findAll(req:Request,res:Response){
    res.json({data:repositorio.findAll})
}

export{findAll}