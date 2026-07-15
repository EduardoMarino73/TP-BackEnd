import { Report_TypeRepository } from "./report_type.repository.js";
const repositorio = new Report_TypeRepository();
function findAll(req, res) {
    res.json({ data: repositorio.findAll() });
}
export { findAll };
//# sourceMappingURL=report_type.controller.js.map