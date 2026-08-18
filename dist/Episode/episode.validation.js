export const sanitizeEpisodeInput = (req, res, next) => {
    req.body.sanitizeEpisodeInput = {
        id_author: req.body.id_author,
        path: req.body.path,
        views: req.body.views,
        description: req.body.description,
        state: req.body.state
    };
    Object.keys(req.body.sanitizeEpisodeInput).forEach((key) => {
        if (req.body.sanitizeEpisodeInput[key] === undefined) {
            delete req.body.sanitizeEpisodeInput[key];
        }
    });
    next();
};
//# sourceMappingURL=episode.validation.js.map