import asyncHandler from "express-async-handler";
import ForumPost from "../models/forumPosts.js";
import User from "../models/users.js";

// GET: return all forum posts
const getForumPosts = asyncHandler(async (req, res) => {
    const forumPosts = await ForumPost.find();
    res.status(200).json(forumPosts);
});

// GET: return forum post given id
const getForumPostById = asyncHandler(async (req, res) => {
    const post = await ForumPost.find({ _id: req.params.id });
    if (!post) {
        res.status(404).json(post);
        throw new Error("Error fetching post by ID");
    } else {
        res.status(200).json(post);
    }
});

// POST: create forum post
const createForumPost = asyncHandler(async (req, res) => {
    if (!req.body.title || !req.body.content || !req.body.author) {
        res.status(400);
        throw new Error("Please fill in all fields");
    }
    const newForumPost = await ForumPost.create({
        title: req.body.title,
        content: req.body.content,
        author: req.body.author,
    });

    res.status(200).json(newForumPost);
});

// POST: delete forum post, confirms ownership
const deleteForumPostById = asyncHandler(async (req, res) => {
    const postAuthor = await ForumPost.findOne({ _id: req.params.id }).select(
        "author"
    );

    if (!postAuthor) {
        res.status(404);
        throw new Error("~1. Post not found");
    }

    const postId = req.params.id;
    const userRequestingDeletion = req.body.username;

    if (!postId || !userRequestingDeletion) {
        res.status(400);
        throw new Error("~2. Please fill in all fields");
    }

    if (postAuthor.author != userRequestingDeletion) {
        res.status(400);
        throw new Error(
            `~3. Cannot delete post. User is not the author. postAuthor: ${postAuthor.author}, userRequestingDeletion: ${userRequestingDeletion}`
        );
    }

    const deletedPost = await ForumPost.findByIdAndDelete(postId);

    if (deletedPost) {
        return res
            .status(200)
            .json({ message: "~4. Post deleted successfully" });
    } else {
        return res.status(404).json({ message: "~5. Post not found" });
    }
});

// POST: dislike post, handles repeat actions
const dislikePost = asyncHandler(async (req, res) => {
    const author = req.body.author;
    console.log(author);
    const post = await ForumPost.findById(req.params.id);

    if (!author || !req.params.id) {
        res.status(404);
        throw new Error("Missing owner or post ID");
    }

    if (!post) {
        res.status(404);
        throw new Error("Post not found");
    }

    // // Check if the user has already disliked the post
    const existingDislike = post.dislikes.find(
        (dislike) => dislike.author === author
    );
    const existingLike = post.likes.find((like) => like.author === author);

    if (existingDislike) {
        // Remove dislike
        try {
            const updatedPost = await ForumPost.findByIdAndUpdate(
                req.params.id,
                { $pull: { dislikes: { author } } }, // Remove dislike where author matches
                { new: true } // Return the updated document
            );
            console.log(
                `${author} has removed their dislike on post ID: ${req.params.id}`
            );
            res.status(200).json(updatedPost);
        } catch (err) {
            res.status(500).json({
                message: "dislikePost: Failed to remove dislike",
            });
        }
    } else if (!existingDislike) {
        if (existingLike) {
            // Add dislike
            post.dislikes.push({ author });

            // Remove like
            try {
                const removedLike = await ForumPost.findByIdAndUpdate(
                    req.params.id,
                    { $pull: { likes: { author } } }, // Remove dislike where author matches
                    { new: true } // Return the updated document
                );
                const addedDislike = await post.save();
                console.log(
                    `${author} has removed their like and added a dislike on post ID: ${req.params.id}`
                );
                res.status(200).json({ removedLike, addedDislike });
            } catch (err) {
                res.status(500).json({ message: "Failed remove like" });
            }
        } else if (!existingLike) {
            // Add dislike
            post.dislikes.push({ author });

            try {
                const updatedPost = await post.save();
                console.log(
                    `${author} has added a dislike on post ID: ${req.params.id}`
                );
                res.status(200).json(updatedPost);
            } catch (err) {
                res.status(500).json({
                    message: "dislikePost: Failed to update post",
                });
            }
        }
    }
});

// POST: like post, handles repeat actions
const likePost = asyncHandler(async (req, res) => {
    const author = req.body.author;
    const post = await ForumPost.findById(req.params.id);

    if (!author || !req.params.id) {
        res.status(404);
        throw new Error("Missing owner or post ID");
    }

    if (!post) {
        res.status(404);
        throw new Error("Post not found");
    }

    // // Check if the user has already like the post
    const existingLike = post.likes.find((like) => like.author === author);
    const existingDislike = post.dislikes.find(
        (dislike) => dislike.author === author
    );

    if (existingLike) {
        // Remove like
        try {
            const updatedPost = await ForumPost.findByIdAndUpdate(
                req.params.id,
                { $pull: { likes: { author } } }, // Remove dislike where author matches
                { new: true } // Return the updated document
            );
            console.log(
                `${author} has removed their like on post ID: ${req.params.id}`
            );
            res.status(200).json(updatedPost);
        } catch (err) {
            res.status(500).json({ message: "Failed remove like" });
        }
    } else if (!existingLike) {
        // remove dislike if it exists
        if (existingDislike) {
            // Add like
            post.likes.push({ author });

            try {
                const removedDislike = await ForumPost.findByIdAndUpdate(
                    req.params.id,
                    { $pull: { dislikes: { author } } }, // Remove dislike where author matches
                    { new: true } // Return the updated document
                );
                const addedLike = await post.save();

                console.log(
                    `${author} has removed their dislike and added a like on post ID: ${req.params.id}`
                );
                res.status(200).json({ removedDislike, addedLike });
            } catch (err) {
                res.status(500).json({
                    message: "Failed to remove dislike and add like",
                });
            }
        } else if (!existingDislike) {
            // Add like
            post.likes.push({ author });

            try {
                const updatedPost = await post.save();
                console.log(
                    `${author} has added a like on post ID: ${req.params.id}`
                );
                res.status(200).json(updatedPost);
            } catch (err) {
                res.status(500).json({ message: "Failed to add like" });
            }
        }
    }
});

// POST: like comment, handles repeat actions
const likeComment = asyncHandler(async (req, res) => {
    const author = req.body.author;
    const commentId = req.params.commentId;
    const postId = req.params.postId;
    const post = await ForumPost.findById(postId);
    console.log(
        `postId: ${postId}, commentId: ${commentId}, author: ${author}`
    );

    if (!author || !postId || !post) {
        res.status(404);
        throw new Error("Missing owner or post not found");
    }

    const comment = post.comments.find((comment) =>
        comment._id.equals(commentId)
    );

    if (!comment) {
        res.status(404);
        throw new Error(`Comment with id: ${commentId} not found`);
    }

    // Check if the user has already like the post
    const existingLike = comment.likes.find((like) => like.author === author);
    const existingDislike = comment.dislikes.find(
        (dislike) => dislike.author === author
    );

    if (existingLike) {
        // Remove like
        try {
            const updatedPost = await ForumPost.findOneAndUpdate(
                { _id: postId, "comments._id": commentId }, // Match the post and the specific comment
                { $pull: { "comments.$.likes": { author } } }, // Remove the like from the comment's likes array
                { new: true } // Return the updated document
            );

            const updatedComment = updatedPost.comments.id(commentId); // Get the updated comment

            console.log(
                `${author} has removed their like on comment ID: ${commentId}`
            );
            res.status(200).json(updatedComment);
        } catch (err) {
            res.status(500).json({ message: "Failed to remove like!!!!!!!" });
        }
    } else if (!existingLike) {
        // If there's no existing like, check for an existing dislike
        if (existingDislike) {
            try {
                // Remove the dislike
                const updatedPost = await ForumPost.findOneAndUpdate(
                    { _id: postId, "comments._id": commentId }, // Match the post and the specific comment
                    {
                        $pull: { "comments.$.dislikes": { author } }, // Remove dislike where author matches
                        $push: { "comments.$.likes": { author } }, // Add the like where author matches
                    },
                    { new: true } // Return the updated document
                );

                const updatedComment = updatedPost.comments.id(commentId); // Get the updated comment

                console.log(
                    `${author} has removed their dislike and added a like on comment ID: ${commentId}`
                );
                res.status(200).json(updatedComment);
            } catch (err) {
                res.status(500).json({
                    message: "Failed to remove dislike and add like",
                });
            }
        } else if (!existingDislike) {
            try {
                // Add like only if there's no existing dislike
                const updatedPost = await ForumPost.findOneAndUpdate(
                    { _id: postId, "comments._id": commentId }, // Match the post and the specific comment
                    { $push: { "comments.$.likes": { author } } }, // Add the like where author matches
                    { new: true } // Return the updated document
                );

                const updatedComment = updatedPost.comments.id(commentId); // Get the updated comment

                console.log(
                    `${author} has added a like on comment ID: ${commentId}`
                );
                res.status(200).json(updatedComment);
            } catch (err) {
                res.status(500).json({ message: "Failed to add like" });
            }
        }
    }
});

// POST: dislike comment, handles repeat actions
const dislikeComment = asyncHandler(async (req, res) => {
    const author = req.body.author;
    const commentId = req.params.commentId;
    const postId = req.params.postId;
    const post = await ForumPost.findById(postId);
    console.log(
        `postId: ${postId}, commentId: ${commentId}, author: ${author}`
    );

    if (!author || !postId || !post) {
        res.status(404);
        throw new Error("Missing owner or post not found");
    }

    const comment = post.comments.find((comment) =>
        comment._id.equals(commentId)
    );

    if (!comment) {
        res.status(404);
        throw new Error(`Comment with id: ${commentId} not found`);
    }

    // Check if the user has already like the post
    const existingLike = comment.likes.find((like) => like.author === author);
    const existingDislike = comment.dislikes.find(
        (dislike) => dislike.author === author
    );

    if (existingDislike) {
        // Remove dislike
        try {
            const updatedPost = await ForumPost.findOneAndUpdate(
                { _id: postId, "comments._id": commentId }, // Match the post and the specific comment
                { $pull: { "comments.$.dislikes": { author } } }, // Remove the dislike from the comment's dislikes array
                { new: true } // Return the updated document
            );

            const updatedComment = updatedPost.comments.id(commentId); // Get the updated comment

            console.log(
                `${author} has removed their dislike on comment ID: ${commentId}`
            );
            res.status(200).json(updatedComment);
        } catch (err) {
            res.status(500).json({ message: "Failed to remove dislike" });
        }
    } else if (!existingDislike) {
        // If there's no existing dislike, check for an existing like
        if (existingLike) {
            try {
                // Remove the like
                const updatedPost = await ForumPost.findOneAndUpdate(
                    { _id: postId, "comments._id": commentId }, // Match the post and the specific comment
                    {
                        $pull: { "comments.$.likes": { author } }, // Remove like where author matches
                        $push: { "comments.$.dislikes": { author } }, // Add the dislike where author matches
                    },
                    { new: true } // Return the updated document
                );

                const updatedComment = updatedPost.comments.id(commentId); // Get the updated comment

                console.log(
                    `${author} has removed their like and added a dislike on comment ID: ${commentId}`
                );
                res.status(200).json(updatedComment);
            } catch (err) {
                res.status(500).json({
                    message: "Failed to remove like and add dislike",
                });
            }
        } else if (!existingLike) {
            try {
                // Add like only if there's no existing dislike
                const updatedPost = await ForumPost.findOneAndUpdate(
                    { _id: postId, "comments._id": commentId }, // Match the post and the specific comment
                    { $push: { "comments.$.dislikes": { author } } }, // Add the like where author matches
                    { new: true } // Return the updated document
                );

                const updatedComment = updatedPost.comments.id(commentId); // Get the updated comment

                console.log(
                    `${author} has added a dislike on comment ID: ${commentId}`
                );
                res.status(200).json(updatedComment);
            } catch (err) {
                res.status(500).json({ message: "Failed to add dislike" });
            }
        }
    }
});

// POST: like reply, handles repeat actions
const likeReply = asyncHandler(async (req, res) => {
    const author = req.body.author;
    const commentId = req.params.commentId;
    const replyId = req.params.replyId;
    const postId = req.params.postId;

    const post = await ForumPost.findById(postId);

    if (!author || !post) {
        res.status(404);
        throw new Error(
            `Author not received or post does not exist with ID: ${postId}`
        );
    }

    const comment = post.comments.find((comment) =>
        comment._id.equals(commentId)
    );

    if (!comment) {
        res.status(404);
        throw new Error(`Comment with id: ${commentId} not found`);
    }

    const reply = comment.replies.find((reply) => reply._id.equals(replyId));

    if (!reply) {
        res.status(404);
        throw new Error(`Reply with id: ${replyId} not found`);
    }

    // Check if the user has already like the post
    const existingLike = reply.likes.find((like) => like.author === author);
    const existingDislike = reply.dislikes.find(
        (dislike) => dislike.author === author
    );

    if (existingLike) {
        // Remove like
        try {
            const updatedPost = await ForumPost.findOneAndUpdate(
                {
                    _id: postId,
                    "comments._id": commentId, // Match the specific comment
                    "comments.replies._id": replyId, // Match the specific reply
                },
                {
                    $pull: { "comments.$.replies.$[reply].likes": { author } }, // Remove the like where author matches
                },
                {
                    arrayFilters: [{ "reply._id": replyId }], // Filter the reply by its ID
                    new: true,
                } // Return the updated document
            );

            if (!updatedPost) {
                return res.status(404).json({
                    message: `Reply not found using postId: ${postId}, commentId: ${commentId}, replyId: ${replyId}, author: ${author}`,
                });
            }

            // Find the updated comment by its ID
            const updatedComment = updatedPost.comments.id(commentId);

            if (!updatedComment) {
                return res.status(404).json({
                    message: `Could not updated comment`,
                });
            }

            // Find the updated reply within the comment by its ID
            const updatedReply = updatedComment.replies.id(replyId);

            if (!updatedReply) {
                return res
                    .status(404)
                    .json({ message: `Could not update reply` });
            }

            console.log(
                `${author} has removed their like on replyId: ${replyId}, within commentId: ${commentId}, within postId: ${postId}`
            );
            res.status(200).json(updatedReply);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Could not remove reply like" });
        }
    } else if (!existingLike) {
        // If there's no existing like, check for an existing dislike
        if (existingDislike) {
            try {
                // Remove the dislike
                const updatedPost = await ForumPost.findOneAndUpdate(
                    {
                        _id: postId,
                        "comments._id": commentId, // Match the specific comment
                        "comments.replies._id": replyId, // Match the specific reply
                    },
                    {
                        $pull: {
                            "comments.$.replies.$[reply].dislikes": { author },
                        }, // Remove the dislike where author matches
                        $push: {
                            "comments.$.replies.$[reply].likes": { author },
                        }, // Add the like where author matches
                    },
                    {
                        arrayFilters: [{ "reply._id": replyId }], // Filter the reply by its ID
                        new: true,
                    } // Return the updated document
                );

                if (!updatedPost) {
                    return res.status(404).json({
                        message: `Reply not found using postId: ${postId}, commentId: ${commentId}, replyId: ${replyId}, author: ${author}`,
                    });
                }

                // Find the updated comment by its ID
                const updatedComment = updatedPost.comments.id(commentId);

                if (!updatedComment) {
                    return res.status(404).json({
                        message: `Could not updated comment`,
                    });
                }

                // Find the updated reply within the comment by its ID
                const updatedReply = updatedComment.replies.id(replyId);

                if (!updatedReply) {
                    return res
                        .status(404)
                        .json({ message: `Could not update reply` });
                }

                console.log(
                    `${author} has removed their dislike and added a like on replyId: ${replyId}, within commentId: ${commentId}, within postId: ${postId}`
                );
                res.status(200).json(updatedReply);
            } catch (error) {
                console.error(error);
                res.status(500).json({
                    message:
                        "Could not remove reply dislike and add reply like",
                });
            }
        } else if (!existingDislike) {
            try {
                // Add like only if there's no existing dislike
                const updatedPost = await ForumPost.findOneAndUpdate(
                    {
                        _id: postId,
                        "comments._id": commentId, // Match the specific comment
                        "comments.replies._id": replyId, // Match the specific reply
                    },
                    {
                        $push: {
                            "comments.$.replies.$[reply].likes": { author }, // Add the like
                        },
                    },
                    {
                        arrayFilters: [{ "reply._id": replyId }], // Filter the reply by its ID
                        new: true, // Return the updated document
                    } // Return the updated document
                );

                if (!updatedPost) {
                    return res
                        .status(404)
                        .json({ message: "Post or comment not found" });
                }

                const updatedComment = updatedPost.comments.id(commentId); // Get the updated comment
                const updatedReply = updatedComment.replies.id(replyId); // Get the updated reply

                if (!updatedReply) {
                    return res.status(404).json({ message: "Reply not found" });
                }

                console.log(
                    `${author} has added a like on reply ID: ${replyId}`
                );
                res.status(200).json(updatedReply);
            } catch (error) {
                console.error(error);
                res.status(500).json({
                    message: "Could not add reply like",
                });
            }
        }
    }
});

// POST: dislike reply, handles repeat actions
const dislikeReply = asyncHandler(async (req, res) => {
    const author = req.body.author;
    const commentId = req.params.commentId;
    const replyId = req.params.replyId;
    const postId = req.params.postId;

    const post = await ForumPost.findById(postId);

    if (!author || !post) {
        res.status(404);
        throw new Error(
            `Author not received or post does not exist with ID: ${postId}`
        );
    }

    const comment = post.comments.find((comment) =>
        comment._id.equals(commentId)
    );

    if (!comment) {
        res.status(404);
        throw new Error(`Comment with id: ${commentId} not found`);
    }

    const reply = comment.replies.find((reply) => reply._id.equals(replyId));

    if (!reply) {
        res.status(404);
        throw new Error(`Reply with id: ${replyId} not found`);
    }

    // Check if the user has already like the post
    const existingLike = reply.likes.find((like) => like.author === author);
    const existingDislike = reply.dislikes.find(
        (dislike) => dislike.author === author
    );

    if (existingDislike) {
        // Remove dislike
        try {
            const updatedPost = await ForumPost.findOneAndUpdate(
                {
                    _id: postId,
                    "comments._id": commentId, // Match the specific comment
                    "comments.replies._id": replyId, // Match the specific reply
                },
                {
                    $pull: {
                        "comments.$.replies.$[reply].dislikes": { author },
                    }, // Remove the dislike where author matches
                },
                {
                    arrayFilters: [{ "reply._id": replyId }], // Filter the reply by its ID
                    new: true,
                } // Return the updated document
            );

            if (!updatedPost) {
                return res.status(404).json({
                    message: `Reply not found using postId: ${postId}, commentId: ${commentId}, replyId: ${replyId}, author: ${author}`,
                });
            }

            // Find the updated comment by its ID
            const updatedComment = updatedPost.comments.id(commentId);

            if (!updatedComment) {
                return res.status(404).json({
                    message: `Could not updated comment`,
                });
            }

            // Find the updated reply within the comment by its ID
            const updatedReply = updatedComment.replies.id(replyId);

            if (!updatedReply) {
                return res
                    .status(404)
                    .json({ message: `Could not update reply` });
            }

            console.log(
                `${author} has removed their dislike on replyId: ${replyId}, within commentId: ${commentId}, within postId: ${postId}`
            );
            res.status(200).json(updatedReply);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Could not remove reply dislike",
            });
        }
    } else if (!existingDislike) {
        // If there's no existing dislike, check for an existing like
        if (existingLike) {
            try {
                // Remove the like
                const updatedPost = await ForumPost.findOneAndUpdate(
                    {
                        _id: postId,
                        "comments._id": commentId, // Match the specific comment
                        "comments.replies._id": replyId, // Match the specific reply
                    },
                    {
                        $pull: {
                            "comments.$.replies.$[reply].likes": { author },
                        }, // Remove the like where author matches
                        $push: {
                            "comments.$.replies.$[reply].dislikes": { author },
                        }, // Add the dislike where author matches
                    },
                    {
                        arrayFilters: [{ "reply._id": replyId }], // Filter the reply by its ID
                        new: true,
                    } // Return the updated document
                );

                if (!updatedPost) {
                    return res.status(404).json({
                        message: `Reply not found using postId: ${postId}, commentId: ${commentId}, replyId: ${replyId}, author: ${author}`,
                    });
                }

                // Find the updated comment by its ID
                const updatedComment = updatedPost.comments.id(commentId);

                if (!updatedComment) {
                    return res.status(404).json({
                        message: `Could not updated comment`,
                    });
                }

                // Find the updated reply within the comment by its ID
                const updatedReply = updatedComment.replies.id(replyId);

                if (!updatedReply) {
                    return res
                        .status(404)
                        .json({ message: `Could not update reply` });
                }

                console.log(
                    `${author} has removed their like and added a dislike on replyId: ${replyId}, within commentId: ${commentId}, within postId: ${postId}`
                );
                res.status(200).json(updatedReply);
            } catch (error) {
                console.error(error);
                res.status(500).json({
                    message:
                        "Could not remove reply like and add reply dislike",
                });
            }
        } else if (!existingLike) {
            try {
                // Add dislike
                const updatedPost = await ForumPost.findOneAndUpdate(
                    {
                        _id: postId,
                        "comments._id": commentId, // Match the specific comment
                        "comments.replies._id": replyId, // Match the specific reply
                    },
                    {
                        $push: {
                            "comments.$.replies.$[reply].dislikes": { author },
                        }, // Add the dislike where author matches
                    },
                    {
                        arrayFilters: [{ "reply._id": replyId }], // Filter the reply by its ID
                        new: true,
                    } // Return the updated document
                );

                if (!updatedPost) {
                    return res.status(404).json({
                        message: `Reply not found using postId: ${postId}, commentId: ${commentId}, replyId: ${replyId}, author: ${author}`,
                    });
                }

                // Find the updated comment by its ID
                const updatedComment = updatedPost.comments.id(commentId);

                if (!updatedComment) {
                    return res.status(404).json({
                        message: `Could not updated comment`,
                    });
                }

                // Find the updated reply within the comment by its ID
                const updatedReply = updatedComment.replies.id(replyId);

                if (!updatedReply) {
                    return res
                        .status(404)
                        .json({ message: `Could not update reply` });
                }

                console.log(
                    `${author} has added a dislike on replyId: ${replyId}, within commentId: ${commentId}, within postId: ${postId}`
                );
                res.status(200).json(updatedReply);
            } catch (error) {
                console.error(error);
                res.status(500).json({
                    message: "Could not add reply dislike",
                });
            }
        }
    }
});

// GET: returns all posts saved by a user using username
const getPostsSavedByUser = asyncHandler(async (req, res) => {
    const username = req.params.username;
    const user = await User.find({ username: username });
    const savedPostsIds = user[0].savedPosts;

    if (!user) {
        res.status(404).json(user);
        throw new Error("No user with username found");
    }

    if (!savedPostsIds) {
        res.status(404).json(savedPostsIds);
        throw new Error("No array of saved posts IDs found");
    }

    const posts = await ForumPost.find({ _id: { $in: savedPostsIds } });

    if (!posts) {
        res.status(500).json(posts);
        throw new Error("Error fetching saved posts with the provided IDs");
    } else {
        res.status(200).json(posts);
    }
});

export {
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
};
