// Middleware check login. Pass when user login success.
function logger(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.render("login", {
            data: {
                error: false
            }
        });
    }
}
// Export modules.
module.exports = logger;