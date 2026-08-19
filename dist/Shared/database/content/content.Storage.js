import path from "path";
export const moviePath = "src\\Shared\\database\\content\\movies";
export const movieTittle = (req, file) => {
    return req.body.tittle + path.extname(file);
};
//# sourceMappingURL=content.Storage.js.map