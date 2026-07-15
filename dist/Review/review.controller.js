import { ReviewRepository } from "./review.repository.js";
const repositorio = new ReviewRepository();
function findAll(req, res) {
    res.json({ data: repositorio.findAll() });
}
export { findAll };
//# sourceMappingURL=review.controller.js.map