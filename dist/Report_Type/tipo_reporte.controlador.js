import { TipoReporteRepositorio } from "./tipo_reporte.repositorio.js";
const repositorio = new TipoReporteRepositorio();
function findAll(req, res) {
    res.json({ data: repositorio.findAll() });
}
export { findAll };
//# sourceMappingURL=tipo_reporte.controlador.js.map