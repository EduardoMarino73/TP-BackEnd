import path from "path";
/**the path where save movies */
export const moviePath = "src\\Shared\\database\\content\\movies";
export const BASE_PATH = "src\\Shared\\database\\content";
export const movieTitle = (req, file) => {
    const data = req.body.data ? JSON.parse(req.body.data) : {};
    return data.title + path.extname(file);
};
//# sourceMappingURL=content.Storage.js.map