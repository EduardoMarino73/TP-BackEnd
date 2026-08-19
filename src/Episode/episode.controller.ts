import { Request, Response } from "express";
import { EpisodieRepository } from "./episode.repository.js";

const repositorio = new EpisodieRepository()

function findAll(req:Request,res:Response){
    res.json({data:repositorio.findAll()})
}