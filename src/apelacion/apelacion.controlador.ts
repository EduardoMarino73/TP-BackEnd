import { Request, Response } from "express";
import { ApelacionRepositorio } from "./apelacion.repositorio.js";

const repositorio = new ApelacionRepositorio()

function findAll(req:Request,res:Response){
    res.json({data:repositorio.findAll()})
}

export {findAll}