import { ComplaintRepository } from "./complaint.repository.js";
const repositorio = new ComplaintRepository();
function findAll(req, res) {
    res.json({ data: repositorio.findAll });
}
export { findAll };
//# sourceMappingURL=complaint.controller.js.map