function logger(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.render("login", { data: { error: false } });
    }
}

module.exports = logger;