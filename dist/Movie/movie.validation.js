export const sanitizeMovieInput = (req, res, next) => {
    req.body.sanitizeMovieInput = {
        id_author: req.body.id_author,
        path: req.file?.path,
        title: req.body.title,
        category: req.body.category,
        views: req.body.views,
        description: req.body.description,
        report: req.body.report,
        state: req.body.state
    };
    /*this remove all undefined params, it works as a partial update */
    Object.keys(req.body.sanitizeMovieInput).forEach((key) => {
        if (req.body.sanitizeMovieInput[key] === undefined) {
            delete req.body.sanitizeMovieInput[key];
        }
    });
    next();
};
//# sourceMappingURL=movie.validation.js.map