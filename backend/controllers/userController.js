import asyncHandler from "express-async-handler";
import User from "../models/users.js";
import { generatePasswordHash } from "../passwordUtils.js";
import ForumPost from "../models/forumPosts.js";

// GET: return all users
const getUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json(users);
});

// GET: return user via username
const getUserByUsername = asyncHandler(async (req, res, next) => {
    const username = req.params.username;
    const user = await User.find({ username: username });
    res.status(200).json(user);
});

// POST: register new user via username, password
const userRegister = asyncHandler(async (req, res, next) => {
    if (!req.body.username || !req.body.password) {
        res.status(400);
        throw new Error("Please fill in all fields");
    }

    const saltHash = generatePasswordHash(req.body.password);
    const salt = saltHash.salt;
    const hash = saltHash.hash;

    const userAlreadyExists = await User.findOne({
        username: req.body.username,
    });

    if (userAlreadyExists) {
        res.status(409);
        throw new Error("User with that username already exists");
    }

    const createUser = await User.create({
        username: req.body.username,
        hash: hash,
        salt: salt,
    });

    res.status(200).json(createUser);
});

// GET: return all forum posts created by username, requires authentication
const getUserForumPosts = asyncHandler(async (req, res, next) => {
    const posts = await ForumPost.find({ author: req.user.username });
    res.status(200).json(posts);
});

// GET: return all forum posts created by username
const getUserForumPostsByUsername = asyncHandler(async (req, res, next) => {
    const posts = await ForumPost.find({ author: req.params.username });
    res.status(200).json(posts);
});

// PATCH: update a user's profile customization, requires authentication
const updateUserProfile = asyncHandler(async (req, res, next) => {
    try {
        const userId = req.params.id;
        const newIcon = req.body.icon;
        const newColor = req.body.color;

        if (!newIcon || !newColor) {
            res.status(400);
            throw new Error("Please fill in all fields");
        }
        console.log(userId, newIcon, newColor);

        const newProfileCustomization = [
            {
                icon: newIcon,
                color: newColor,
            },
        ];

        const updatedDocument = await User.findByIdAndUpdate(
            userId,
            { $set: { profileCustomization: newProfileCustomization } },
            { new: true }
        );
        res.status(200).json(updatedDocument);
    } catch (error) {
        res.status(500).json({ error: "Failed to update" });
    }
});

// PATCH: save a post to a user's profile, requires authentication
const savePost = asyncHandler(async (req, res, next) => {
    const postId = req.params.id;
    const user = await User.findOne({ username: req.body.username });

    if (!postId || !user) {
        res.status(400);
        throw new Error("Please fill in all fields");
    }

    const postAlreadyExists = await User.findOne({
        username: req.body.username,
        savedPosts: { $in: [postId] },
    });

    if (!postAlreadyExists) {
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { $push: { savedPosts: postId } },
            { new: true }
        );
        if (updatedUser) {
            res.status(200).json(updatedUser);
        } else {
            res.status(500).json({
                error: "Failed to save post to users account",
            });
        }
    }
    if (postAlreadyExists) {
        res.status(403);
        throw new Error("Post already saved");
    }
});

// PATCH: remove a saved post from a user's profile, requires authentication
const removedSavedPost = asyncHandler(async (req, res, next) => {
    const postId = req.params.id;
    const user = await User.findOne({ username: req.body.username });

    if (!postId || !user) {
        res.status(400);
        throw new Error("Please fill in all fields");
    }

    const postAlreadyExists = await User.findOne({
        username: req.body.username,
        savedPosts: { $in: [postId] },
    });

    if (postAlreadyExists) {
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { $pull: { savedPosts: postId } },
            { new: true }
        );
        if (updatedUser) {
            res.status(200).json(updatedUser);
        } else {
            res.status(500).json({
                error: "Failed to save post to users account",
            });
        }
    }
    if (!postAlreadyExists) {
        res.status(403);
        throw new Error("Post already saved");
    }
});

// PATCH: update a users dark mode preference (on/off), requires authentication
const updateThemePreference = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ username: req.body.username });
    const newDarkModeValue = req.body.newDarkModeValue;
    console.log(newDarkModeValue);
    if (!user) {
        res.status(404);
        throw new Error("Could not find user with provided username");
    }
    if (newDarkModeValue === user.darkMode) {
        res.status(404);
        throw new Error("Cant change value to same value");
    }

    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $set: { darkMode: newDarkModeValue } },
        { new: true }
    );

    if (updatedUser) {
        res.status(200).json(updatedUser);
    } else {
        res.status(500);
        throw new Error("Could not update users darkMode preference");
    }
});

// PATCH: follow a user account, requires authentication
// adds this user to authenticated user's following list
// adds authenticated user to this user's followers list
const followUser = asyncHandler(async (req, res, next) => {
    const followRequester = await User.findOne({
        username: req.body.followRequester,
    });
    const followReceiver = await User.findOne({
        username: req.params.followReceiver,
    });

    if (!followRequester || !followReceiver) {
        res.status(400);
        throw new Error(
            "Requires both the followRequester and followReceiver to process follow request."
        );
    }

    const alreadyFollowing = await User.findOne({
        username: req.body.followRequester,
        following: { $elemMatch: { username: followReceiver.username } },
    });

    if (!alreadyFollowing) {
        const updatedFollowRequester = await User.findByIdAndUpdate(
            followRequester._id,
            {
                $push: {
                    following: {
                        _id: followReceiver._id,
                        username: followReceiver.username,
                        profileCustomization:
                            followReceiver.profileCustomization,
                    },
                },
            },
            { new: true }
        );

        const updatedFollowReceiver = await User.findByIdAndUpdate(
            followReceiver._id,
            {
                $push: {
                    followers: {
                        _id: followRequester._id,
                        username: followRequester.username,
                        profileCustomization:
                            followRequester.profileCustomization,
                    },
                },
            },
            { new: true }
        );

        if (!updatedFollowRequester || !updatedFollowReceiver) {
            res.status(500);
            throw new Error("Could not complete follow request");
        } else {
            res.status(200).json({
                message: "Follow request completed successfully",
            });
        }
    } else if (alreadyFollowing) {
        res.status(403);
        throw new Error("Already following that user.");
    }
});

// PATCH: follow a user account, requires authentication
// removes this user from authenticated user's following list
// removes authenticated user from this user's followers list
const unfollowUser = asyncHandler(async (req, res, next) => {
    const unfollowRequester = await User.findOne({
        username: req.body.unfollowRequester,
    });
    const unfollowReceiver = await User.findOne({
        username: req.params.unfollowReceiver,
    });

    if (!unfollowRequester || !unfollowReceiver) {
        res.status(400);
        throw new Error(
            "Requires both the followRequester and followReceiver to process follow request."
        );
    }

    const alreadyFollowing = await User.findOne({
        username: req.body.unfollowRequester,
        following: { $elemMatch: { username: unfollowReceiver.username } },
    });

    if (alreadyFollowing) {
        const updatedUnfollowRequester = await User.findByIdAndUpdate(
            unfollowRequester._id,
            {
                $pull: {
                    following: {
                        username: unfollowReceiver.username,
                    },
                },
            },
            { new: true }
        );

        const updatedUnfollowReceiver = await User.findByIdAndUpdate(
            unfollowReceiver._id,
            {
                $pull: {
                    followers: {
                        username: unfollowRequester.username,
                    },
                },
            },
            { new: true }
        );

        if (!updatedUnfollowRequester || !updatedUnfollowReceiver) {
            res.status(500);
            throw new Error("Could not complete follow request");
        } else {
            res.status(200).json({
                message: "Unfollow request completed successfully",
            });
        }
    } else if (!alreadyFollowing) {
        res.status(403);
        throw new Error("Already not following that user.");
    }
});

// DELETE: delete user profile, requires authentication
// 1. deletes the user profile
// 2. deletes all forum posts created by user
// 4. sets deleted user's username to '[deleted]' for comments & replies on all other forum posts
// 5. deletes the user from following & followers lists for all other users
const deleteUser = asyncHandler(async (req, res, next) => {
    const username = req.params.username;

    try {
        // Delete the user from Users
        await User.findOneAndDelete({ username });

        // Delete all forum posts where the user is the author
        await ForumPost.deleteMany({ author: username });

        // Update comments to set author to "[deleted]"
        await ForumPost.updateMany(
            { "comments.author": username },
            { $set: { "comments.$.author": "[deleted]" } } // Use the positional operator
        );

        // Find all posts with comments
        const postsWithComments = await ForumPost.find({
            "comments.replies": { $exists: true, $not: { $size: 0 } },
        });

        // Iterate through each post and update reply authors
        for (const post of postsWithComments) {
            for (const comment of post.comments) {
                // Check each reply's author against the username
                for (let i = 0; i < comment.replies.length; i++) {
                    const reply = comment.replies[i];
                    // If the reply's author matches the username, update it
                    if (reply.author === username) {
                        reply.author = "[deleted]";
                    }
                }
            }
            // Save the updated comments back to the post
            await post.save();
        }

        // Patch other user profiles' following and followers arrays
        await User.updateMany(
            { "followers.username": username },
            { $pull: { followers: { username } } }
        );

        await User.updateMany(
            { "following.username": username },
            { $pull: { following: { username } } }
        );

        res.status(200).send({
            message: "User and related data successfully deleted",
        });
    } catch (error) {
        console.error("Deletion error:", error);
        res.status(500).send({ error: "An error occurred during deletion" });
    }
});

export {
    getUsers,
    userRegister,
    getUserForumPosts,
    getUserForumPostsByUsername,
    getUserByUsername,
    updateUserProfile,
    savePost,
    removedSavedPost,
    updateThemePreference,
    followUser,
    unfollowUser,
    deleteUser,
};
