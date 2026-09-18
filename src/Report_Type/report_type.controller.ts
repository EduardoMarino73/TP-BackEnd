import { Request, Response } from "express";
import { ReportTypeRepository } from "./report_type.repository.js";

const repository = new ReportTypeRepository()

function findAll(req:Request,res:Response){
    res.json({data:repository.findAll()})
}

export{findAll}
