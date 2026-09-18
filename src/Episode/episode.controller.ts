import { Request, Response } from "express";
import { EpisodeRepository } from "./episode.repository.js";

const repository = new EpisodeRepository()

function findAll(req:Request,res:Response){
    res.json({data:repository.findAll()})
}
