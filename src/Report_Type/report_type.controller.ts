import { Request, Response } from "express";
import { Report_TypeRepository } from "./report_type.repository.js";

const repositorio = new Report_TypeRepository()

function findAll(req:Request,res:Response){
    res.json({data:repositorio.findAll()})
}

export{findAll}