import { ReseñaRepositorio } from "./reseña.repositorio.js";
const repositorio = new ReseñaRepositorio();
function findAll(req, res) {
    res.json({ data: repositorio.findAll() });
}
export { findAll };
//# sourceMappingURL=rese%C3%B1a.controlador.js.map