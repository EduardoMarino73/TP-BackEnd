import { EpisodieRepository } from "./episode.repository.js";
const repositorio = new EpisodieRepository();
function findAll(req, res) {
    res.json({ data: repositorio.findAll() });
}
//# sourceMappingURL=episode.controller.js.map