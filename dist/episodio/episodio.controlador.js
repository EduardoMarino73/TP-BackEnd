import { EpisodioRepositorio } from "./episodio.repositorio.js";
const repositorio = new EpisodioRepositorio();
function findAll(req, res) {
    res.json({ data: repositorio.findAll() });
}
//# sourceMappingURL=episodio.controlador.js.map