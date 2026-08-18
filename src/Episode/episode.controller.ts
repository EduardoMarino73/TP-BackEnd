import { Request, Response } from "express";
import { EpisodieRepository } from "./episode.repository.js";
import { EpisodeService } from "./episode.service.js";

const service = new EpisodeService(new EpisodieRepository());

export const findAll = async (req:Request,res:Response) => {
    return  res.send(await service.findAll());
}

export const findOne = async (req:Request,res:Response) => {
    const episode = await service.findOne(req.params.id as string);
    if(!episode){
        return res.sendStatus(404).send({message:"episode not found"});
    }
    return res.send(episode);
}

export const create = async(req:Request,res:Response) => {
    const episodeInput = req.body.sanitizeEpisodeInput;
    const requiredFields = ["id_author", "tittle", "views", "description", "state", "id_Season",] as const;
    const missingFields = requiredFields.filter((field => episodeInput[field] === undefined));

    if(missingFields.length > 0){
        return res.status(400).json({
            message: "Missing required episode fields",
            fields: missingFields
        });
    }
    const episode = await service.create(episodeInput);
    return res.status(201).json({message:"episode created", data: episode?.tittle});
}

export const update = async(req:Request,res:Response) => {
    const id_Episode = req.params.id as string;
    const episode = await service.update(id_Episode,req.body.sanitizeEpisodeInput);

    if(!episode){
        res.sendStatus(404).json({message: "episode not found"});
    }

    return res.sendStatus(200).send({message: "episode updated", data:episode?.tittle});
}

export const remove = async(req:Request,res:Response) => {
    const id_Episode = req.params.id as string;
    const result = await service.remove(id_Episode);

    if(!result){
        return res.sendStatus(500).send({message: "internal error"});
    }

    return res.sendStatus(200).send({message: ` episode with id: ${id_Episode} was removed`});
}