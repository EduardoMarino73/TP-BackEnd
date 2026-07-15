import { DenunciaRepositorio } from "./denuncia.repositorio.js";
const repositorio = new DenunciaRepositorio();
function findAll(req, res) {
    res.json({ data: repositorio.findAll });
}
export { findAll };
//# sourceMappingURL=denuncia.controlador.js.map