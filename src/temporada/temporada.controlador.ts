import { Request, Response } from "express";
import { TemporadaRepositorio } from "./temporada.repositorio.js";


const repositorio = new TemporadaRepositorio()

function findAll(req:Request,res:Response){
    res.json({data:repositorio.findAll()})
}

export {findAll}