// middleware used to check authentication for protected routes
const isAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).json({
            msg: "You are not authorized to view this resource",
        });
    }
};

export default isAuth;
