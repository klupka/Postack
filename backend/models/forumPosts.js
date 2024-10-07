import mongoose from "mongoose";

const Schema = mongoose.Schema;

// reply schema

/* content: String
 * author: String
 * likes: String array
 * dislikes: String array
 */
const replySchema = new Schema(
    {
        content: {
            type: String,
            required: true,
        },
        author: {
            type: String,
            required: true,
        },
        likes: [
            {
                author: {
                    type: String,
                    required: true,
                },
            },
        ],
        dislikes: [
            {
                author: {
                    type: String,
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

// comment schema

/* content: String
 * author: String
 * replies: reply schema array
 * likes: String array
 * dislikes: String array
 */
const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
        },
        author: {
            type: String,
            required: true,
        },
        replies: [replySchema],
        likes: [
            {
                author: {
                    type: String,
                    required: true,
                },
            },
        ],
        dislikes: [
            {
                author: {
                    type: String,
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

// forum post schema

/* title: String
 * content: String
 * author: String
 * comments: comment schema array
 * likes: String array
 * dislikes: String array
 */
const forumPostSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        author: {
            type: String,
            required: true,
        },
        comments: [commentSchema],
        likes: [
            {
                author: {
                    type: String,
                    required: true,
                },
            },
        ],
        dislikes: [
            {
                author: {
                    type: String,
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

const ForumPost = mongoose.model("forumPost", forumPostSchema);

export default ForumPost;
