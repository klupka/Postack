import asyncHandler from "express-async-handler";
import ForumPost from "../models/forumPosts.js";

// GET: return comments via the associated postId
const getCommentsByPostId = asyncHandler(async (req, res) => {
    const postId = req.params.postId;
    const forumPost = await ForumPost.findById(postId);
    const comments = forumPost.comments;
    res.status(200).json(comments);
});

// POST: create comment using the associated postId, content, and author; requires authentication
const createComment = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { content, author } = req.body;

    if (!postId || !content || !author) {
        res.status(400);
        throw new Error("Missing information. Cannot process request");
    }

    try {
        const post = await ForumPost.findById(postId);
        if (!post) {
            res.status(404);
            throw new Error("Post not found");
        }

        const newComment = {
            content,
            author,
        };

        post.comments.push(newComment);
        const updatedPost = await post.save();

        const addedComment =
            updatedPost.comments[updatedPost.comments.length - 1];

        res.status(200).json(addedComment);
    } catch (error) {
        res.status(500);
        throw new Error(error.message);
    }
});

// POST: create comment using the associated postId, commentId, content, and author; requires authentication
const createReply = asyncHandler(async (req, res) => {
    const { postId, commentId } = req.params;
    const { content, author } = req.body;

    if (!postId || !content || !author || !commentId) {
        res.status(400);
        throw new Error("Missing information. Cannot process request");
    }

    try {
        const post = await ForumPost.findById(postId);
        if (!post) {
            res.status(404);
            throw new Error("Post not found");
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            res.status(404);
            throw new Error("Comment not found");
        }

        const newReply = {
            content,
            author,
        };

        comment.replies.push(newReply);

        await post.save();

        const addedReply = comment.replies[comment.replies.length - 1];

        res.status(200).json(addedReply);
    } catch (error) {
        res.status(500);
        throw new Error(error.message);
    }
});

// PATCH: Locate post -> locate comment -> confirm ownership of comment -> delete comment; requires authentication
const deleteComment = asyncHandler(async (req, res) => {
    const commentId = req.body.commentId;
    const postId = req.body.postId;
    const userRequestingDeletion = req.body.userRequestingDeletion;
    const commentAuthor = req.body.commentAuthor;

    if (!commentId || !userRequestingDeletion || !postId || !commentAuthor) {
        res.status(400);
        throw new Error("Missing information. Cannot process request");
    }

    const post = await ForumPost.findById(postId);
    if (!post) {
        res.status(404);
        throw new Error("Post not found");
    }

    if (commentAuthor === userRequestingDeletion) {
        const updatedPost = await ForumPost.findByIdAndUpdate(
            postId,
            {
                $pull: {
                    comments: {
                        _id: commentId,
                    },
                },
            },
            { new: true }
        );

        if (!updatedPost) {
            res.status(500);
            throw new Error("Could not delete comment");
        } else {
            res.status(200).json({
                message: "Successfully deleted comment",
            });
        }
    } else {
        res.status(500).json({
            message: "The user requesting deletion does not own this comment",
        });
    }
});

// PATCH: Locate post -> locate comment -> locate reply -> confirm ownership of reply -> delete reply; requires authentication
const deleteReply = asyncHandler(async (req, res) => {
    const commentId = req.body.commentId;
    const replyId = req.body.replyId;
    const postId = req.body.postId;
    const userRequestingDeletion = req.body.userRequestingDeletion;
    const replyAuthor = req.body.replyAuthor;

    if (
        !commentId ||
        !replyId ||
        !postId ||
        !userRequestingDeletion ||
        !replyAuthor
    ) {
        res.status(400);
        throw new Error("Missing information. Cannot process request");
    }

    const post = await ForumPost.findById(postId);
    if (!post) {
        res.status(404);
        throw new Error("Post not found");
    }

    if (replyAuthor === userRequestingDeletion) {
        const updatedPost = await ForumPost.findOneAndUpdate(
            { _id: postId, "comments.replies._id": replyId },
            {
                $pull: {
                    "comments.$.replies": { _id: replyId },
                },
            },
            { new: true }
        );

        if (!updatedPost) {
            res.status(500);
            throw new Error("Could not delete reply");
        } else {
            res.status(200).json({
                message: "Successfully deleted reply",
            });
        }
    } else {
        res.status(500).json({
            message: "The user requesting deletion does not own this reply",
        });
    }
});

export {
    getCommentsByPostId,
    createComment,
    createReply,
    deleteComment,
    deleteReply,
};
