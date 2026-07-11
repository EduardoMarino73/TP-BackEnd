import { Request, Response } from "express";
import { ReseñaRepositorio } from "./reseña.repositorio.js";

const repositorio = new ReseñaRepositorio()

function findAll(req:Request,res:Response){
    res.json({data:repositorio.findAll()})
}

export {findAll}