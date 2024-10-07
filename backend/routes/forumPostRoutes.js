import express from "express";
import {
    getForumPosts,
    createForumPost,
    getForumPostById,
    dislikePost,
    likePost,
    likeComment,
    dislikeComment,
    likeReply,
    dislikeReply,
    deleteForumPostById,
    getPostsSavedByUser,
} from "../controllers/forumPostController.js";
import isAuth from "../isAuthMiddleware.js";

const router = express.Router();

// This file uses path: "/forum-posts"

// GET: return all forum posts
router.get("/", getForumPosts);

// GET: return forum post given id
router.get("/:id", getForumPostById);

// POST: create forum post
router.post("/create-forum-post", createForumPost);

// POST: delete forum post, confirms ownership
router.delete("/delete/:id", isAuth, deleteForumPostById);

// POST: dislike post, handles repeat actions
router.post("/dislike-post/:id", isAuth, dislikePost);

// POST: like post, handles repeat actions
router.post("/like-post/:id", isAuth, likePost);

// POST: like comment, handles repeat actions
router.post("/like-comment/:postId/:commentId", isAuth, likeComment);

// POST: dislike comment, handles repeat actions
router.post("/dislike-comment/:postId/:commentId", isAuth, dislikeComment);

// POST: like reply, handles repeat actions
router.post("/like-reply/:postId/:commentId/:replyId", isAuth, likeReply);

// POST: dislike reply, handles repeat actions
router.post("/dislike-reply/:postId/:commentId/:replyId", isAuth, dislikeReply);

// GET: returns all posts saved by a user using username
router.get("/saved-posts/:username", getPostsSavedByUser);

export default router;
