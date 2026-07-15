import { TemporadaRepositorio } from "./season.repository.js";
const repositorio = new TemporadaRepositorio();
function findAll(req, res) {
    res.json({ data: repositorio.findAll() });
}
export { findAll };
//# sourceMappingURL=season.controller.js.map