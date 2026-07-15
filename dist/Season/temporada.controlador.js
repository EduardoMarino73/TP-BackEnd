import { TemporadaRepositorio } from "./temporada.repositorio.js";
const repositorio = new TemporadaRepositorio();
function findAll(req, res) {
    res.json({ data: repositorio.findAll() });
}
export { findAll };
//# sourceMappingURL=temporada.controlador.js.map