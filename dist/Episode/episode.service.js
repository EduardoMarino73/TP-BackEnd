import { Episode } from "./episode.entity.js";
export class EpisodeService {
    constructor(repo) {
        this.repo = repo;
    }
    async findOne(id) {
        const episodeID = Number(id);
        if (!Number.isInteger(episodeID) || episodeID < 1) {
            return Promise.resolve(undefined);
        }
        return await this.repo.findOne(episodeID);
    }
    async findAll() {
        return await this.repo.findAll();
    }
    async create(input) {
        const episode = new Episode(input.id_author, input.pathF, input.tittle, input.views, input.description, input.state, input.id_Season);
        return await this.repo.create(episode);
    }
    update(id, input) {
        const id_ep = Number(id);
        if (!Number.isInteger(id_ep) || id_ep < 1) {
            return Promise.resolve(undefined);
        }
        return this.repo.update(id_ep, input);
    }
    remove(id) {
        const id_ep = Number(id);
        if (!Number.isInteger(id_ep) || id_ep < 1) {
            return Promise.resolve(false);
        }
        return this.repo.delete(id_ep);
    }
}
//# sourceMappingURL=episode.service.js.map