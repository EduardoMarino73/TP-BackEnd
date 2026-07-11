import { Request, Response } from "express";
import { DenunciaRepositorio } from "./denuncia.repositorio.js";

const repositorio = new DenunciaRepositorio()

function findAll(req:Request,res:Response){
    res.json({data:repositorio.findAll})
}

export{findAll}