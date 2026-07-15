import { ApelacionRepositorio } from "./apelacion.repositorio.js";
const repositorio = new ApelacionRepositorio();
function findAll(req, res) {
    res.json({ data: repositorio.findAll() });
}
export { findAll };
//# sourceMappingURL=apelacion.controlador.js.map