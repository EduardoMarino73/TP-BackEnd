import { Request, Response } from "express";
import { TipoReporteRepositorio } from "./tipo_reporte.repositorio.js";

const repositorio = new TipoReporteRepositorio()

function findAll(req:Request,res:Response){
    res.json({data:repositorio.findAll()})
}

export{findAll}