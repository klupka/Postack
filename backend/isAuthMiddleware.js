// middleware used to check authentication for protected routes
const isAuth = (req, res, next) => {
    // debugging statements
    console.log("Checking authentication...");
    console.log("Is Authenticated:", req.isAuthenticated());
    console.log("Session Data:", req.session);

    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).json({
            msg: "You are not authorized to view this resource",
        });
    }
};

export default isAuth;
