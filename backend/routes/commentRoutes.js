import express from "express";
import {
    getCommentsByPostId,
    createComment,
    createReply,
    deleteComment,
    deleteReply,
} from "../controllers/commentController.js";
import isAuth from "../isAuthMiddleware.js";

const router = express.Router();

// This file uses path: "/comments"

// GET: return comments via the associated post ID
router.get("/:postId", getCommentsByPostId);

// POST: create comment using the associated postId, content, and author; requires authentication
router.post("/create-comment/:postId", isAuth, createComment);

// POST: create comment using the associated postId, commentId, content, and author; requires authentication
router.post("/create-reply/:postId/:commentId", isAuth, createReply);

// PATCH: Locate post -> locate comment -> confirm ownership of comment -> delete comment; requires authentication
router.patch("/delete-comment/", isAuth, deleteComment);

// PATCH: Locate post -> locate comment -> locate reply -> confirm ownership of reply -> delete reply; requires authentication
router.patch("/delete-reply", isAuth, deleteReply);

export default router;
