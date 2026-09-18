import { Request, Response } from "express";
import { ComplaintRepository } from "./complaint.repository.js";

const repository = new ComplaintRepository()

function findAll(req:Request,res:Response){
    res.json({data:repository.findAll})
}

export{findAll}
