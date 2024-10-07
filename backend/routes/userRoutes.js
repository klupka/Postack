import express from "express";
import {
    getUsers,
    getUserByUsername,
    getUserForumPosts,
    getUserForumPostsByUsername,
    userRegister,
    updateUserProfile,
    savePost,
    removedSavedPost,
    updateThemePreference,
    followUser,
    unfollowUser,
    deleteUser,
} from "../controllers/userController.js";
import isAuth from "../isAuthMiddleware.js";
import passport from "passport";

const router = express.Router();

// This file uses path: "/users"

// GET: return all users
router.get("/", getUsers);

// GET: return user via username
router.get("/user/:username", getUserByUsername);

// POST: register new user via username, password
router.post("/register", userRegister);

// POST: login existing user via username, password, requires authentication
router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res
                .status(401)
                .send({ success: false, message: "Authentication failed" });
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.send({
                success: true,
                message: "Authentication successful",
                user,
            });
        });
    })(req, res, next);
});

// GET: used to check if user is authenticated
router.get("/protected-route", isAuth, (req, res, next) => {
    res.json({ message: "This is a protected route", user: req.user });
});

// GET: logs out existing user, requires authentication
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.status(200).json({ message: "Logout successful" });
    });
});

// GET: return all forum posts created by username, requires authentication
router.get("/user-posts", isAuth, getUserForumPosts);

// GET: return all forum posts created by username
router.get("/user-posts/:username", getUserForumPostsByUsername);

// PATCH: update a user's profile customization, requires authentication
router.patch("/update-profile/:id", isAuth, updateUserProfile);

// PATCH: save a post to a user's profile, requires authentication
router.patch("/save-post/:id", isAuth, savePost);

// PATCH: remove a saved post from a user's profile, requires authentication
router.patch("/remove-saved-post/:id", isAuth, removedSavedPost);

// PATCH: update a users dark mode preference (on/off), requires authentication
router.patch("/update-theme-preference/", isAuth, updateThemePreference);

// PATCH: follow a user account, requires authentication
// adds this user to authenticated user's following list
// adds authenticated user to this user's followers list
router.patch("/follow/:followReceiver", isAuth, followUser);

// PATCH: follow a user account, requires authentication
// removes this user from authenticated user's following list
// removes authenticated user from this user's followers list
router.patch("/unfollow/:unfollowReceiver", isAuth, unfollowUser);

// DELETE: delete user profile, requires authentication
// 1. deletes the user profile
// 2. deletes all forum posts created by user
// 4. sets deleted user's username to '[deleted]' for comments & replies on all other forum posts
// 5. deletes the user from following & followers lists for all other users
router.delete("/delete-user/:username", isAuth, deleteUser);

export default router;
