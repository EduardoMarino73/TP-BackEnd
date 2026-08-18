import { Repository } from "../Shared/repository.js";
import { Episode } from "./episode.entity.js";

export class EpisodeService{

    public constructor(private repo:Repository<Episode>){}

    async findOne(id:string): Promise<Episode | undefined>{
        const episodeID = Number(id);
        if(!Number.isInteger(episodeID) || episodeID < 1){
            return Promise.resolve(undefined);
        }
        return await this.repo.findOne(episodeID);
    }

    async findAll(): Promise<Episode[] | undefined>{
        return await this.repo.findAll();
    }

    async create(input:Omit<Episode, "id_Episode" | "report">): Promise<Episode | undefined>{
        const episode = new Episode(
            input.id_author,
            input.pathF,
            input.tittle,
            input.views,
            input.description,
            input.state,
            input.id_Season
        );
        return await this.repo.create(episode);
    }

    update(id:string, input:Partial<Episode>): Promise<Episode | undefined>{
        const id_ep = Number(id);
        if(!Number.isInteger(id_ep) || id_ep < 1){
            return Promise.resolve(undefined);
        }
        return this.repo.update(id_ep,input);
    }

    remove(id:string): Promise<Boolean>{
        const id_ep = Number(id);
        if(!Number.isInteger(id_ep) || id_ep < 1){
            return Promise.resolve(false);
        }
        return this.repo.delete(id_ep);
    }
}