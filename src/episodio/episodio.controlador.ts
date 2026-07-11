import { Request, Response } from "express";
import { EpisodioRepositorio } from "./episodio.repositorio.js";

const repositorio = new EpisodioRepositorio()

function findAll(req:Request,res:Response){
    res.json({data:repositorio.findAll()})
}