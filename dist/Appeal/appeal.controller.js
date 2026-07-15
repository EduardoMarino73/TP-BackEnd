import { AppealRepository } from "./appeal.repository.js";
const repositorio = new AppealRepository();
function findAll(req, res) {
    res.json({ data: repositorio.findAll() });
}
export { findAll };
//# sourceMappingURL=appeal.controller.js.map