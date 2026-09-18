import { Repository } from "../Shared/repository.js";
import { Episode } from "./episode.entity.js";

/*episode.repository is the DAO.
It's in charge of finding or saving the episodes it needs to work with*/

export class EpisodeRepository implements Repository<Episode> {

    /*In a similar way, we do the same thing as in the movie repository, defining the
    specific behavior of the general methods we get from the interface contract */

    async findAll(): Promise<Episode[]> {
        throw new Error("Method not implemented.");
    }
    async findOne(id: number): Promise<Episode | undefined> {
        throw new Error("Method not implemented.");
    }
    async create(item: Episode): Promise<Episode> {
        throw new Error("Method not implemented.");
    }
    async update(id: number, input: Partial<Episode>): Promise<Episode | undefined> {
        throw new Error("Method not implemented.");
    }
    async delete(id: number): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    
}
