import React from "react";
import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faNoteSticky,
    faThumbsUp,
    faThumbsDown,
    faMessage,
    faCopy,
    faTrashCan,
    faBookmark,
} from "@fortawesome/free-regular-svg-icons";
import {
    faArrowLeft,
    faBookmark as faBookmarkSolid,
    faCheck,
    faCommentSlash,
    faCompass,
    faEllipsis,
    faThumbsDown as faThumbsDownSolid,
    faThumbsUp as faThumbsUpSolid,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

// Page: PostDetails
// view posts in full with comments and replies
// authenticated users can create comments and replies
// authenticated users can still copy post link, save/unsave post, like/dislike post, delete if owns post
const PostDetails = ({
    setGlobalNotificationMessages,
    globalNotificationMessages,
}) => {
    // post id passed through URL params
    const { id } = useParams();
    // useState hook to store post data
    const [post, setPost] = useState([]);
    // useState hook to store comments data (includes replies)
    const [comments, setComments] = useState([]);
    // useState hook to verify authentication state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // useState hook to store new comment data
    const [newComment, setNewComment] = useState({
        content: "",
        author: "",
    });
    // useState hook to store new reply data
    const [newReply, setNewReply] = useState({
        commentId: "",
        content: "",
        author: "",
    });
    // backend URL
    const baseURL = "http://localhost:8000";
    // frontend URL
    const URLFrontEndBase = "http://localhost:5173";
    // useState hook to verify user authentication has been checked
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    // useState hook to handle reply form visibility
    const [openReplyForm, setOpenReplyForm] = useState(null);
    // post details endpoint URL
    const postDetailsURL = `${baseURL}/forum-posts/${id}`;
    // post comments endpoint URL
    const postCommentsURL = `${baseURL}/comments/${id}`;
    // check user authentication endpoint URL
    const checkAuthURL = `${baseURL}/users/protected-route`;
    // create comment endpoint URL
    const createCommentURL = `${baseURL}/comments/create-comment/${id}`;
    // useState hook to store replies count
    const [repliesCount, setRepliesCount] = useState(0);
    // useState hook to store user data
    const [userData, setUserData] = useState([]);
    // navigation hook
    const navigate = useNavigate();
    // useState hook to disable comment/reply button while comment/reply request is processing
    const [executingOperation, setExecutingOperation] = useState(false);
    // useState hook to handle copy link confirmation, mainly for UX purposes
    const [postLinkCopied, setPostLinkCopied] = useState(false);
    // useState hook to handle post options dropdown menu visibility
    const [isDropDownDisplayed, setIsDropDownDisplayed] = useState(false);
    // useRef hooks to handle post options dropdown menu open/close states
    // clicks outside dropdown will close it
    const dropdownListRef = useRef(null);
    const dropdownButtonRef = useRef(null);
    // useState hook to show/hide delete post confirmation window
    const [showDeletePostWindow, setShowDeletePostWindow] = useState(false);
    // useState hook to store post id that is to be deleted
    const [postToDeleteId, setPostToDeleteId] = useState(null);
    // useState hook to store comment data that is to be deleted
    const [commentToDelete, setCommentToDelete] = useState(null);
    // useState hook to disable comment delete button while delete request is processing
    const [deletingUserComment, setDeletingUserComment] = useState(false);
    // useState hook to store reply data that is to be deleted
    const [replyToDelete, setReplyToDelete] = useState(null);
    // useState hook to disable reply delete button while delete request is processing
    const [deletingUserReply, setDeletingUserReply] = useState(false);
    // useState hook to disable save post button while save request is processing
    const [savingPost, setSavingPost] = useState(false);

    // toggle visibility of post options dropdown menu when clicking ellipses button
    const handleShowHide = () => {
        setIsDropDownDisplayed(!isDropDownDisplayed);
    };

    // GET request to retrieve post data using post id via endpoint
    const getPost = () => {
        axios
            .get(postDetailsURL)
            .then((res) => {
                setPost(res.data[0]);
            })
            .catch((err) => {
                console.log("Error getting post:", err);
                setPost([]);
            });
    };

    // GET request to retrieve comment data using post id via endpoint
    const getComments = () => {
        setExecutingOperation(false);
        axios
            .get(postCommentsURL)
            .then((res) => {
                setComments(res.data);
            })
            .catch((err) => {
                console.log(err);
                setComments([]);
            });
    };

    // check user authentication via endpoint
    // if authenticated: show comment/reply forms
    const checkAuth = () => {
        axios
            .get(checkAuthURL, { withCredentials: true })
            .then((res) => {
                setUserData(res.data.user);
                setNewComment({
                    ...newComment,
                    author: res.data.user.username,
                });
                setNewReply({
                    ...newReply,
                    author: res.data.user.username,
                });
                setIsAuthenticated(true);
                setIsAuthChecked(true);
            })
            .catch((err) => {
                console.log("User not authenticated");
                setIsAuthenticated(false);
                setIsAuthChecked(true);
            });
    };

    // on load: get post data, comments/replies data, check if user is authenticated
    useEffect(() => {
        getPost();
        getComments();
        checkAuth();
    }, []);

    // count replies for each comment
    // executed on load and again if comments are changed
    useEffect(() => {
        let total = 0;
        comments.forEach((comment) => {
            total += comment.replies.length;
            setRepliesCount(total);
        });
    }, [comments]);

    // sets new comment data as it is entered through form
    const handleCommentInput = (event) => {
        setNewComment({
            ...newComment,
            [event.target.name]: event.target.value,
        });
    };

    // create comment via endpoint and reset form data
    const handleCommentSubmit = (event) => {
        setExecutingOperation(true);
        event.preventDefault();
        const updatedComment = {
            content: newComment.content.replace(/^\s+|\s+$/g, ""),
            author: newComment.author,
        };
        axios
            .post(createCommentURL, updatedComment, {
                withCredentials: true,
            })
            .then((res) => {
                // Re-render the comments to include the newly create comment
                getComments();
                // Reset input values to empty. Don't forget to set value variable in <input>
                setNewComment({
                    content: "",
                    author: newComment.author,
                });
                setExecutingOperation(false);
            })
            .catch((err) => {
                console.log(err);
                setExecutingOperation(false);
            });
    };

    // sets new reply data as it is entered through form
    const handleReplyInput = (commentId, event) => {
        setNewReply({
            ...newReply,
            [commentId]: event.target.value,
        });
    };

    // create reply via endpoint and reset form data
    const handleReplySubmit = (commentId) => (e) => {
        setExecutingOperation(true);
        e.preventDefault();
        const formData = new FormData(e.target);
        const replyContent = {
            content: Object.fromEntries(formData.entries()).content.replace(
                /^\s+|\s+$/g,
                ""
            ),
            author: newReply.author,
        };
        onSubmitFunction(replyContent, commentId, id, setNewReply, getComments);
        setNewReply({
            commentId: "",
            content: "",
            author: newReply.author,
        });
    };

    // handles visible reply forms, only one is visible at a time
    const handleOpenForm = (commentId) => {
        setOpenReplyForm((prevId) => (prevId === commentId ? null : commentId));
    };

    // dislike post using backend endpoint
    // refreshes post data to reflect the change
    const dislikePost = (event) => {
        if (userData == "") {
            navigate("/register");
        } else {
            event.preventDefault();
            const author = { author: userData.username };
            axios
                .post(`${baseURL}/forum-posts/dislike-post/${id}`, author, {
                    withCredentials: true,
                })
                .then((res) => {
                    console.log("Post disliked. Re-rendering post information");
                    getPost();
                })
                .catch((err) => console.log(err));
        }
    };

    // like post using backend endpoint
    // refreshes post data to reflect the change
    const likePost = (event) => {
        if (userData == "") {
            navigate("/register");
        } else {
            event.preventDefault();
            const author = { author: userData.username };
            axios
                .post(`${baseURL}/forum-posts/like-post/${id}`, author, {
                    withCredentials: true,
                })
                .then((res) => {
                    console.log("Post liked. Re-rendering post information");
                    getPost();
                })
                .catch((err) => console.log(err));
        }
    };

    // dislike comment using backend endpoint
    // refreshes comment data to reflect the change
    const dislikeComment = (commentId, event) => {
        if (userData == "") {
            navigate("/register");
        } else {
            event.preventDefault();
            const author = { author: userData.username };
            axios
                .post(
                    `${baseURL}/forum-posts/dislike-comment/${id}/${commentId}`,
                    author,
                    {
                        withCredentials: true,
                    }
                )
                .then((res) => {
                    console.log(
                        "Comment liked. Re-rendering comment information"
                    );
                    getComments();
                })
                .catch((err) => console.log(err));
        }
    };

    // like comment using backend endpoint
    // refreshes comment data to reflect the change
    const likeComment = (commentId, event) => {
        if (userData == "") {
            navigate("/register");
        } else {
            event.preventDefault();
            const author = { author: userData.username };
            axios
                .post(
                    `${baseURL}/forum-posts/like-comment/${id}/${commentId}`,
                    author,
                    {
                        withCredentials: true,
                    }
                )
                .then((res) => {
                    console.log(
                        "Comment liked. Re-rendering comment information"
                    );
                    getComments();
                })
                .catch((err) => console.log(err));
        }
    };

    // like reply using backend endpoint
    // refreshes comment (includes replies) data to reflect the change
    const likeReply = (commentId, replyId, event) => {
        if (userData == "") {
            navigate("/register");
        } else {
            event.preventDefault();
            const author = { author: userData.username };
            axios
                .post(
                    `${baseURL}/forum-posts/like-reply/${id}/${commentId}/${replyId}`,
                    author,
                    {
                        withCredentials: true,
                    }
                )
                .then((res) => {
                    console.log(
                        "Reply liked. Re-rendering comment information"
                    );
                    getComments();
                })
                .catch((err) => console.log(err));
        }
    };

    // dislike reply using backend endpoint
    // refreshes comment (includes replies) data to reflect the change
    const dislikeReply = (commentId, replyId, event) => {
        if (userData == "") {
            navigate("/register");
        } else {
            event.preventDefault();
            const author = { author: userData.username };
            axios
                .post(
                    `${baseURL}/forum-posts/dislike-reply/${id}/${commentId}/${replyId}`,
                    author,
                    {
                        withCredentials: true,
                    }
                )
                .then((res) => {
                    console.log(
                        "Reply disliked. Re-rendering comment information"
                    );
                    getComments();
                })
                .catch((err) => console.log(err));
        }
    };

    // copy link to a post, temporarily shows 'copied' instead of 'copy'
    const copyPostLink = (postId) => {
        navigator.clipboard.writeText(
            `${URLFrontEndBase}/forum-post/${postId}`
        );
        setPostLinkCopied(true);
        setTimeout(function () {
            setPostLinkCopied(false);
        }, 1000);
    };

    // listens for mousedown events
    // if a click is outside of the post options menu then hide dropdown menu
    const handleClickOutside = (event) => {
        if (
            !dropdownListRef.current.contains(event.target) &&
            !dropdownButtonRef.current.contains(event.target)
        ) {
            setIsDropDownDisplayed(false);
        }
    };

    // listens for mousedown events and executes handleClickOutside()
    // handles visibility of the post options dropdown menu
    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // save and unsave a post to user profile using a passed postId via backend endpoint
    // creates a global notification on success/fail and refreshes userData + forum posts
    const savePostToUserProfile = (postId) => {
        const userToSavePost = userData.username;
        setSavingPost(true);
        console.log("saving post..");
        axios
            .patch(
                `${baseURL}/users/save-post/${postId}`,
                { username: userToSavePost },
                {
                    withCredentials: true,
                }
            )
            .then((res) => {
                console.log("Post saved successfully.");
                addMessage("Post saved successfully.");
                setSavingPost(false);
                checkAuth();
            })
            .catch((err) => {
                if (err.status === 403) {
                    console.log("Post already saved. Removing saved post...");
                    axios
                        .patch(
                            `${baseURL}/users/remove-saved-post/${postId}`,
                            { username: userToSavePost },
                            {
                                withCredentials: true,
                            }
                        )
                        .then((res) => {
                            console.log("Removed saved post successfully.");
                            addMessage("Removed saved post successfully.");
                            setSavingPost(false);
                            checkAuth();
                        })
                        .catch((err) => {
                            console.log(err);
                            addMessage("Could not remove saved post.");
                            setSavingPost(false);
                        });
                } else {
                    console.log(err, "Something went wrong.");
                    addMessage("Could not save post.");
                    setSavingPost(false);
                }
            });
    };

    // deletes the forum post given postId via endpoint
    // option only available to the authenticated user who owns post
    // creates a global notification on success/fail
    const deleteForumPostById = (postId) => {
        console.log("deleting", postId);
        axios
            .delete(`${baseURL}/forum-posts/delete/${postId}`, {
                data: { username: userData.username },
                withCredentials: true,
            })
            .then((res) => {
                console.log(`${userData.username} deleted a post.`);
                navigate("/");
                addMessage("Successfully deleted post.");
            })
            .catch((err) => {
                console.log("Error deleting post", err);
                addMessage("Could not delete post.");
            });
    };

    // deletes the comment using commentToDelete via endpoint
    // option only available to the authenticated user who owns the comment
    // creates a global notification on success/fail
    const deleteComment = () => {
        setDeletingUserComment(true);
        axios
            .patch(
                `${baseURL}/comments/delete-comment`,
                {
                    commentId: commentToDelete.commentId,
                    postId: commentToDelete.postId,
                    commentAuthor: commentToDelete.commentAuthor,
                    userRequestingDeletion: userData.username,
                },
                { withCredentials: true }
            )
            .then((res) => {
                addMessage("Successfully deleted comment.");
                setDeletingUserComment(false);
                setCommentToDelete(null);
                getComments();
            })
            .catch((err) => {
                console.log("Error deleting comment", err);
                addMessage("Could not delete comment.");
                setDeletingUserComment(false);
                setCommentToDelete(null);
            });
    };

    // deletes the reply using replyToDelete via endpoint
    // option only available to the authenticated user who owns the reply
    // creates a global notification on success/fail
    const deleteReply = () => {
        setDeletingUserReply(true);
        axios
            .patch(
                `${baseURL}/comments/delete-reply`,
                {
                    commentId: replyToDelete.replyId,
                    replyId: replyToDelete.replyId,
                    postId: replyToDelete.postId,
                    replyAuthor: replyToDelete.replyAuthor,
                    userRequestingDeletion: userData.username,
                },
                { withCredentials: true }
            )
            .then((res) => {
                addMessage("Successfully deleted reply.");
                setDeletingUserReply(false);
                setReplyToDelete(null);
                getComments();
            })
            .catch((err) => {
                console.log("Error deleting reply", err);
                addMessage("Could not delete reply.");
                setDeletingUserReply(false);
                setReplyToDelete(null);
            });
    };

    // generate unique id values for global notifications
    // required for notifications to expire independently (setTimeout)
    const generateUniqueId = () => {
        let id;
        do {
            id = Math.floor(Math.random() * 100000); // Generate a random number
        } while (
            globalNotificationMessages.some((message) => message.id === id)
        ); // Check if it's already in the array
        return id;
    };

    // function to create global notifications; passed a msg value
    const addMessage = (msg) => {
        const newMessage = { id: generateUniqueId(), text: msg }; // Create a new message with a unique id
        const newMessages = [...globalNotificationMessages, newMessage];
        setGlobalNotificationMessages(newMessages);

        // Set a timeout to remove the message after 5 seconds
        setTimeout(() => {
            removeMessage(newMessage.id);
        }, 6000);
    };

    // called when a notification expires after 6 sec; removes element from array using unique id
    const removeMessage = (id) => {
        // Remove the message by its id
        setGlobalNotificationMessages((prevMessages) =>
            prevMessages.filter((message) => message.id !== id)
        );
    };

    // if the post does not exist, return appropriate message
    if (!post) {
        return (
            <div className="px-auto text-wrap flex justify-center mt-20 animate-slideDown w-full lg:max-w-[800px] lg:mx-auto sm:w-[calc(100%-60px)] sm:ml-[60px]">
                <div className="flex justify-center flex-col gap-2 px-2">
                    <div className="text-[2rem] font-bold text-text text-center">
                        That post doesn't exist!
                    </div>
                    <div className="text-center text-sm text-placeholder">
                        The post you are looking for may have been removed.
                    </div>
                    <div className="mt-20 text-text flex justify-center text-center font-bold">
                        <button
                            onClick={() => {
                                navigate("/");
                            }}
                            className="bg-primary py-2 px-3 rounded-full"
                        >
                            Go to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // if post data is not found, display loading animation
    if (post.length === 0 || isAuthChecked === false || userData === "") {
        return (
            <div className="px-auto text-wrap flex justify-center mt-10 animate-fadeInBounce w-full lg:max-w-[800px] lg:mx-auto sm:w-[calc(100%-60px)] sm:ml-[60px]">
                <FontAwesomeIcon
                    icon={faCompass}
                    className="animate-windUpSpin text-[2.5rem] text-text"
                />
            </div>
        );
    }

    // all else, show post details
    return (
        <>
            {showDeletePostWindow === true ? (
                <div className="fixed top-0 left-0 w-full h-full animate-slideDown z-[999]">
                    <div
                        className="fixed top-0 left-0 w-full h-full"
                        onClick={() => {
                            setShowDeletePostWindow(!showDeletePostWindow);
                        }}
                    ></div>
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 w-[90%] sm:w-fit -translate-y-1/2 rounded-xl shadow-[0_35px_60px_1500px_rgba(0,0,0,0.5)]">
                        <div className="bg-cardBg p-5 rounded-xl">
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-center align-middle">
                                    <div className="text-xl font-bold">
                                        Delete Post?
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowDeletePostWindow(
                                                !showDeletePostWindow
                                            );
                                        }}
                                        className="flex justify-center align-middle items-center bg-border rounded-full p-2 hover:brightness-75"
                                    >
                                        <FontAwesomeIcon
                                            icon={faXmark}
                                            className="w-5 h-5 "
                                        />
                                    </button>
                                </div>
                                <div className="text-base text-offText mt-2">
                                    Are you sure you want to delete your post?
                                    You can't undo this.
                                </div>
                                <div className="text-sm text-placeholderText mt-2">
                                    ID: {postToDeleteId}
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end mt-5">
                                <button
                                    onClick={() => {
                                        setShowDeletePostWindow(
                                            !showDeletePostWindow
                                        );
                                    }}
                                    className="rounded-full px-3 py-2 bg-border text-text font-semibold w-[6rem] hover:brightness-75"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeletePostWindow(
                                            !showDeletePostWindow
                                        );
                                        deleteForumPostById(postToDeleteId);
                                    }}
                                    className="rounded-full px-3 py-2 bg-accent text-text font-semibold w-[6rem] hover:brightness-75"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                ""
            )}
            {commentToDelete != null ? (
                <div className="fixed top-0 left-0 w-full h-full animate-slideDown z-[999]">
                    <div
                        className="fixed top-0 left-0 w-full h-full"
                        onClick={() => {
                            setCommentToDelete(null);
                        }}
                    ></div>
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 w-[90%] sm:w-fit -translate-y-1/2 rounded-xl shadow-[0_35px_60px_1500px_rgba(0,0,0,0.5)]">
                        <div className="bg-cardBg p-5 rounded-xl">
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-center align-middle">
                                    <div className="text-xl font-bold">
                                        Delete Comment?
                                    </div>
                                    <button
                                        onClick={() => {
                                            setCommentToDelete(null);
                                        }}
                                        className="flex justify-center align-middle items-center bg-border rounded-full p-2 hover:brightness-75"
                                    >
                                        <FontAwesomeIcon
                                            icon={faXmark}
                                            className="w-5 h-5 "
                                        />
                                    </button>
                                </div>
                                <div className="text-base text-offText mt-2">
                                    Are you sure you want to delete your
                                    comment? You can't undo this.
                                </div>
                                <div className="text-sm text-placeholderText mt-2">
                                    ID: {commentToDelete.commentId}
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end mt-5">
                                <button
                                    onClick={() => {
                                        setCommentToDelete(null);
                                    }}
                                    className="rounded-full px-3 py-2 bg-border text-text font-semibold w-[6rem] hover:brightness-75"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={
                                        deletingUserComment ? true : false
                                    }
                                    onClick={() => {
                                        deleteComment();
                                    }}
                                    className="rounded-full px-3 py-2 bg-accent text-text font-semibold w-[6rem] hover:brightness-75"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                ""
            )}
            {replyToDelete != null ? (
                <div className="fixed top-0 left-0 w-full h-full animate-slideDown z-[999]">
                    <div
                        className="fixed top-0 left-0 w-full h-full"
                        onClick={() => {
                            setReplyToDelete(null);
                        }}
                    ></div>
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 w-[90%] sm:w-fit -translate-y-1/2 rounded-xl shadow-[0_35px_60px_1500px_rgba(0,0,0,0.5)]">
                        <div className="bg-cardBg p-5 rounded-xl">
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-center align-middle">
                                    <div className="text-xl font-bold">
                                        Delete Reply?
                                    </div>
                                    <button
                                        onClick={() => {
                                            setReplyToDelete(null);
                                        }}
                                        className="flex justify-center align-middle items-center bg-border rounded-full p-2 hover:brightness-75"
                                    >
                                        <FontAwesomeIcon
                                            icon={faXmark}
                                            className="w-5 h-5 "
                                        />
                                    </button>
                                </div>
                                <div className="text-base text-offText mt-2">
                                    Are you sure you want to delete your
                                    comment? You can't undo this.
                                </div>
                                <div className="text-sm text-placeholderText mt-2">
                                    ID: {replyToDelete.replyId}
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end mt-5">
                                <button
                                    onClick={() => {
                                        setReplyToDelete(null);
                                    }}
                                    className="rounded-full px-3 py-2 bg-border text-text font-semibold w-[6rem] hover:brightness-75"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={deletingUserReply ? true : false}
                                    onClick={() => {
                                        deleteReply();
                                    }}
                                    className="rounded-full px-3 py-2 bg-accent text-text font-semibold w-[6rem] hover:brightness-75"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                ""
            )}
            <div className="px-4 text-wrap slide-down-animation text-text animate-slideDown w-full lg:max-w-[800px] lg:mx-auto sm:w-[calc(100%-60px)] sm:ml-[60px]">
                <div className="flex justify-between items-center">
                    <div className="mb-[1rem] flex gap-[1rem] items-center mt-2">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex justify-center items-center bg-primary h-[2.5rem] w-[2.5rem] rounded-full"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </button>
                        <div className="flex gap-[0.40rem] items-center text-center h-6 align-middle text-offText">
                            <span>
                                <FontAwesomeIcon
                                    className="flex items-center align-middle justify-center text-lg pt-[0.10rem] text-accent"
                                    icon={faNoteSticky}
                                />
                            </span>
                            <span className="text-offText font-light text-sm flex flex-col justify-center leading-6">
                                by{" "}
                            </span>
                            <span>
                                <Link
                                    to={`/user/${post.author}`}
                                    className="hover:underline decoration-2 decoration-accent underline-offset-2 text-text font-semibold"
                                >
                                    {post.author}
                                </Link>
                            </span>
                            <span className="text-offText font-light text-sm flex flex-col justify-center leading-6">
                                •
                            </span>
                            <span className="text-offText font-light text-sm flex flex-col justify-center leading-6">
                                {moment(post.created_at).fromNow()}
                            </span>
                        </div>
                    </div>
                    <div className="" dir="rtl">
                        <button
                            ref={dropdownButtonRef}
                            onClick={handleShowHide}
                            className={`flex items-center justify-center rounded-full hover:bg-border p-[0.35rem] ${
                                isDropDownDisplayed
                                    ? "bg-border"
                                    : "bg-transparent"
                            }`}
                        >
                            <FontAwesomeIcon
                                className="text-xl w-5 h-5"
                                icon={faEllipsis}
                            />
                        </button>
                        <div
                            ref={dropdownListRef}
                            className={
                                isDropDownDisplayed
                                    ? "flex flex-col border border-border rounded-xl absolute w-fit overflow-hidden bg-background text-sm animate-slideDown"
                                    : "hidden"
                            }
                        >
                            <button
                                onClick={() => {
                                    copyPostLink(post._id);
                                }}
                                className={`h-12 flex justify-end items-center gap-3 px-5 text-md hover:bg-border ${
                                    postLinkCopied
                                        ? "text-accent"
                                        : "text-offText"
                                }`}
                            >
                                {postLinkCopied ? "Copied URL" : "Copy URL"}
                                <FontAwesomeIcon
                                    icon={postLinkCopied ? faCheck : faCopy}
                                    className="text-lg w-5 h-5"
                                />
                            </button>
                            {isAuthenticated === true ? (
                                <button
                                    onClick={() => {
                                        savePostToUserProfile(post._id);
                                    }}
                                    className="h-12 flex justify-end items-center gap-3 px-5 text-md text-offText hover:bg-border"
                                    disabled={savingPost ? true : false}
                                >
                                    {userData.savedPosts.includes(
                                        String(post._id)
                                    )
                                        ? "Remove from saved"
                                        : "Save"}
                                    {userData.savedPosts.includes(
                                        String(post._id)
                                    ) ? (
                                        <FontAwesomeIcon
                                            icon={faBookmarkSolid}
                                            className="text-lg w-5 h-5 text-accent"
                                        />
                                    ) : (
                                        <FontAwesomeIcon
                                            icon={faBookmark}
                                            className="text-lg w-5 h-5"
                                        />
                                    )}
                                </button>
                            ) : (
                                ""
                            )}
                            {userData.username === post.author ? (
                                <button
                                    onClick={() => {
                                        handleShowHide();
                                        setPostToDeleteId(post._id);
                                        setShowDeletePostWindow(
                                            !showDeletePostWindow
                                        );
                                    }}
                                    className="h-12 flex justify-end items-center gap-3 px-5 text-md text-offText hover:brightness-125 bg-accent"
                                >
                                    Delete
                                    <FontAwesomeIcon
                                        icon={faTrashCan}
                                        className="text-lg w-5 h-5"
                                    />
                                </button>
                            ) : (
                                ""
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-[0.5rem]">
                    <div className="text-2xl font-semibold text-text">
                        {post.title}
                    </div>
                    <div className="mt-[1rem] mb-[3rem] text-offText">
                        <pre className="text-wrap font-light">
                            {post.content}
                        </pre>
                    </div>
                </div>
                <div className="flex gap-[0.5rem] mb-[1rem]">
                    <div className="flex gap-[1.5rem] items-center w-fit font-medium">
                        <div className="flex">
                            {post.likes.some(
                                (like) => like.author === userData.username
                            ) ? (
                                <button
                                    className="py-2 px-3 rounded-l-full flex gap-3 items-center align-middle text-center text-md text-text bg-accent hover:text-offText group"
                                    onClick={likePost}
                                >
                                    <span className="flex items-center align-middle text-center group-hover:scale-110 transition-transform duration-10 ease-in-out">
                                        <FontAwesomeIcon
                                            icon={faThumbsUpSolid}
                                        />
                                    </span>
                                    <span className="flex items-center align-middle text-center leading-[1rem] ">
                                        {post.likes.length}
                                    </span>
                                </button>
                            ) : (
                                <button
                                    className="py-2 px-3 border-r-0 rounded-l-full flex gap-3 items-center align-middle text-center text-md bg-cardButtonBg text-text hover:text-offText group"
                                    onClick={likePost}
                                >
                                    <span className="flex items-center align-middle text-center group-hover:scale-110 transition-transform duration-10 ease-in-out">
                                        <FontAwesomeIcon icon={faThumbsUp} />
                                    </span>
                                    <span className="flex items-center align-middle text-center leading-[1rem] ">
                                        {post.likes.length}
                                    </span>
                                </button>
                            )}
                            {post.dislikes.some(
                                (dislike) =>
                                    dislike.author === userData.username
                            ) ? (
                                <button
                                    onClick={dislikePost}
                                    className="py-2 px-3 border-l-0 rounded-r-full flex gap-3 items-center align-middle text-center text-md text-text bg-secondary hover:text-offText group"
                                >
                                    <span className="flex items-center align-middle text-center group-hover:scale-110 transition-transform duration-10 ease-in-out">
                                        <FontAwesomeIcon
                                            icon={faThumbsDownSolid}
                                        />
                                    </span>
                                    <span className="flex items-center align-middle text-center leading-[1rem] ">
                                        {post.dislikes.length}
                                    </span>
                                </button>
                            ) : (
                                <button
                                    onClick={dislikePost}
                                    className="py-2 px-3 border-l-0 rounded-r-full flex gap-3 items-center align-middle text-center text-md text-text bg-cardButtonBg hover:text-offText group"
                                >
                                    <span className="flex items-center align-middle text-center group-hover:scale-110 transition-transform duration-10 ease-in-out">
                                        <FontAwesomeIcon icon={faThumbsDown} />
                                    </span>
                                    <span className="flex items-center align-middle text-center leading-[1rem] ">
                                        {post.dislikes.length}
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="py-1 px-3 rounded-full flex gap-3 items-center align-middle text-center text-md text-text bg-cardButtonBg hover:cursor-pointer hover:text-offText">
                        <span className="flex items-center justify-center text-sm leading-[1rem]">
                            <FontAwesomeIcon icon={faMessage} />
                        </span>
                        <span className="text-md text-center items-center leading-[1rem] font-medium">
                            {comments.length + repliesCount}
                        </span>
                    </div>
                </div>
                {isAuthenticated ? (
                    <div className="mb-[1rem]">
                        <form
                            onSubmit={handleCommentSubmit}
                            className="overflow-hidden border border-border p-1 rounded-xl bg-background focus-within:border-primary"
                        >
                            <textarea
                                placeholder="Add a comment"
                                type="text"
                                onChange={handleCommentInput}
                                name="content"
                                value={newComment.content}
                                className="w-[100%] resize-y overflow-hidden bg-background p-1 rounded-xl outline-none placeholder:text-placeholderText placeholder:font-light focus:text-text"
                            ></textarea>
                            <br />
                            {newComment.content !== "" ? (
                                <div className="flex w-full justify-end">
                                    <button
                                        disabled={
                                            executingOperation ? true : false
                                        }
                                        className={`flex leading-1 items-center py-[0.25rem] px-[0.8rem] rounded-full mb-2 mr-2 ${
                                            executingOperation
                                                ? "bg-border"
                                                : "bg-primary"
                                        }`}
                                    >
                                        Comment
                                    </button>
                                </div>
                            ) : (
                                ""
                            )}
                        </form>
                    </div>
                ) : (
                    ""
                )}
                {comments.length > 0 ? (
                    <div>
                        {comments.map((comment) => {
                            return (
                                <div className="py-[0.5rem]" key={comment._id}>
                                    <div className="flex gap-[0.5rem]">
                                        <span>
                                            {comment.author === "[deleted]" ? (
                                                <div className="text-text opacity-50">
                                                    {comment.author}
                                                </div>
                                            ) : (
                                                <Link
                                                    to={`/user/${comment.author}`}
                                                    className="hover:underline decoration-2 decoration-accent underline-offset-2 text-text font-semibold"
                                                >
                                                    {comment.author}
                                                </Link>
                                            )}
                                        </span>
                                        <span className="text-offText font-light text-sm flex flex-col justify-center leading-6">
                                            •
                                        </span>
                                        <span className="text-offText font-light text-sm flex flex-col justify-center leading-6">
                                            {moment(
                                                comment.created_at
                                            ).fromNow()}
                                        </span>
                                    </div>

                                    <div className="my-[0.5rem] font-light">
                                        <pre className="text-wrap font-light">
                                            {comment.content}
                                        </pre>
                                    </div>

                                    <div className="flex gap-[0.5rem] mb-[1rem]">
                                        <div className="flex gap-[1.5rem] items-center w-fit font-medium">
                                            <div className="flex">
                                                {comment.likes.some(
                                                    (like) =>
                                                        like.author ===
                                                        userData.username
                                                ) ? (
                                                    <button
                                                        className="py-2 px-3 rounded-l-full flex gap-3 items-center align-middle text-center text-md text-accent hover:bg-cardButtonBg"
                                                        onClick={() => {
                                                            likeComment(
                                                                comment._id,
                                                                event
                                                            );
                                                        }}
                                                    >
                                                        <span className="flex items-center align-middle text-center">
                                                            <FontAwesomeIcon
                                                                icon={
                                                                    faThumbsUpSolid
                                                                }
                                                            />
                                                        </span>
                                                        <span className="flex items-center align-middle text-center leading-[1rem] text-text">
                                                            {
                                                                comment.likes
                                                                    .length
                                                            }
                                                        </span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="py-2 px-3 border-r-0 rounded-l-full flex gap-3 items-center align-middle text-center text-md text-text hover:bg-cardButtonBg"
                                                        onClick={() => {
                                                            likeComment(
                                                                comment._id,
                                                                event
                                                            );
                                                        }}
                                                    >
                                                        <span className="flex items-center align-middle text-center">
                                                            <FontAwesomeIcon
                                                                icon={
                                                                    faThumbsUp
                                                                }
                                                            />
                                                        </span>
                                                        <span className="flex items-center align-middle text-center leading-[1rem] text-text">
                                                            {
                                                                comment.likes
                                                                    .length
                                                            }
                                                        </span>
                                                    </button>
                                                )}
                                                {comment.dislikes.some(
                                                    (dislike) =>
                                                        dislike.author ===
                                                        userData.username
                                                ) ? (
                                                    <button
                                                        onClick={() => {
                                                            dislikeComment(
                                                                comment._id,
                                                                event
                                                            );
                                                        }}
                                                        className="py-2 px-3 border-l-0 rounded-r-full flex gap-3 items-center align-middle text-center text-md text-secondary hover:bg-cardButtonBg"
                                                    >
                                                        <span className="flex items-center align-middle text-center">
                                                            <FontAwesomeIcon
                                                                icon={
                                                                    faThumbsDownSolid
                                                                }
                                                            />
                                                        </span>
                                                        <span className="flex items-center align-middle text-center leading-[1rem] text-text">
                                                            {
                                                                comment.dislikes
                                                                    .length
                                                            }
                                                        </span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            dislikeComment(
                                                                comment._id,
                                                                event
                                                            );
                                                        }}
                                                        className="py-2 px-3 border-l-0 rounded-r-full flex gap-3 items-center align-middle text-center text-md text-text hover:bg-cardButtonBg"
                                                    >
                                                        <span className="flex items-center align-middle text-center">
                                                            <FontAwesomeIcon
                                                                icon={
                                                                    faThumbsDown
                                                                }
                                                            />
                                                        </span>
                                                        <span className="flex items-center align-middle text-center leading-[1rem] text-text">
                                                            {
                                                                comment.dislikes
                                                                    .length
                                                            }
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (userData == "") {
                                                    navigate("/register");
                                                } else {
                                                    handleOpenForm(comment._id);
                                                }
                                            }}
                                            className="py-1 px-3 flex gap-3 items-center align-middle text-center text-md text-text hover:cursor-pointer hover:bg-cardButtonBg rounded-full"
                                        >
                                            <span className="flex items-center justify-center text-sm leading-[1rem] h-6 align-middle">
                                                <FontAwesomeIcon
                                                    icon={faMessage}
                                                />
                                            </span>
                                            <span className="text-md text-center items-center font-medium h-[1.65rem]">
                                                Reply
                                            </span>
                                        </button>
                                        {isAuthenticated &&
                                        comment.author === userData.username ? (
                                            <button
                                                onClick={() => {
                                                    setCommentToDelete({
                                                        commentId: comment._id,
                                                        postId: id,
                                                        commentAuthor:
                                                            comment.author,
                                                    });
                                                }}
                                                className="py-1 px-3 flex gap-3 items-center align-middle text-center text-md text-text hover:cursor-pointer hover:bg-cardButtonBg rounded-full"
                                            >
                                                <span className="flex items-center justify-center text-sm leading-[1rem] h-6 align-middle">
                                                    <FontAwesomeIcon
                                                        icon={faTrashCan}
                                                    />
                                                </span>
                                                <span className="text-md text-center items-center font-medium h-[1.65rem]">
                                                    Delete
                                                </span>
                                            </button>
                                        ) : (
                                            ""
                                        )}
                                    </div>
                                    {isAuthenticated &&
                                    openReplyForm === comment._id ? (
                                        <div
                                            className="mb-[1rem]"
                                            key={comment._id}
                                        >
                                            <form
                                                onSubmit={handleReplySubmit(
                                                    comment._id
                                                )}
                                                className="overflow-hidden border border-border p-1 rounded-xl bg-background focus-within:border-primary"
                                            >
                                                <textarea
                                                    placeholder="Add a reply"
                                                    type="text"
                                                    onChange={(e) =>
                                                        handleReplyInput(
                                                            comment._id,
                                                            e
                                                        )
                                                    }
                                                    name="content"
                                                    value={
                                                        newReply[comment._id] ||
                                                        ""
                                                    }
                                                    className="w-[100%] resize-y overflow-hidden bg-background p-1 rounded-xl outline-none placeholder:text-placeholderText placeholder:font-light focus:text-text"
                                                ></textarea>
                                                <br />
                                                <div className="flex w-full justify-end">
                                                    <button
                                                        disabled={
                                                            executingOperation ===
                                                            false
                                                                ? false
                                                                : true
                                                        }
                                                        className={` leading-1 items-center py-[0.25rem] px-[0.8rem] rounded-full mb-2 mr-2
                                                        ${
                                                            newReply[
                                                                comment._id
                                                            ]
                                                                ? "flex"
                                                                : "hidden"
                                                        } ${
                                                            executingOperation
                                                                ? "bg-border"
                                                                : "bg-primary"
                                                        }`}
                                                    >
                                                        Reply
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    ) : (
                                        ""
                                    )}
                                    <div className="comment-card border-l-2 border-border pl-5 ml-4">
                                        {comment.replies.map((reply, index) => {
                                            return (
                                                <div key={index}>
                                                    <div className="flex gap-[0.5rem]">
                                                        <span>
                                                            {reply.author ===
                                                            "[deleted]" ? (
                                                                <div className="text-text opacity-50">
                                                                    {
                                                                        reply.author
                                                                    }
                                                                </div>
                                                            ) : (
                                                                <Link
                                                                    to={`/user/${reply.author}`}
                                                                    className="hover:underline decoration-2 decoration-accent underline-offset-2 text-text font-semibold"
                                                                >
                                                                    {
                                                                        reply.author
                                                                    }
                                                                </Link>
                                                            )}
                                                        </span>
                                                        <span className="text-offText font-light text-sm flex flex-col justify-center leading-6">
                                                            •
                                                        </span>
                                                        <span className="text-offText font-light text-sm flex flex-col justify-center leading-6">
                                                            {moment(
                                                                reply.created_at
                                                            ).fromNow()}
                                                        </span>
                                                    </div>
                                                    <div className="my-[0.5rem] font-light">
                                                        {reply.content}
                                                    </div>
                                                    <div className="flex gap-[0.5rem] mb-[1rem]">
                                                        <div className="flex gap-[1.5rem] items-center w-fit font-medium">
                                                            <div className="flex">
                                                                {reply.likes.some(
                                                                    (like) =>
                                                                        like.author ===
                                                                        userData.username
                                                                ) ? (
                                                                    <button
                                                                        className="py-2 px-3 rounded-l-full flex gap-3 items-center align-middle text-center text-md text-accent hover:bg-cardButtonBg"
                                                                        onClick={() => {
                                                                            likeReply(
                                                                                comment._id,
                                                                                reply._id,
                                                                                event
                                                                            );
                                                                        }}
                                                                    >
                                                                        <span className="flex items-center align-middle text-center">
                                                                            <FontAwesomeIcon
                                                                                icon={
                                                                                    faThumbsUpSolid
                                                                                }
                                                                            />
                                                                        </span>
                                                                        <span className="flex items-center align-middle text-center leading-[1rem] text-text">
                                                                            {
                                                                                reply
                                                                                    .likes
                                                                                    .length
                                                                            }
                                                                        </span>
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        className="py-2 px-3 border-r-0 rounded-l-full flex gap-3 items-center align-middle text-center text-md text-text hover:bg-cardButtonBg"
                                                                        onClick={() => {
                                                                            likeReply(
                                                                                comment._id,
                                                                                reply._id,
                                                                                event
                                                                            );
                                                                        }}
                                                                    >
                                                                        <span className="flex items-center align-middle text-center">
                                                                            <FontAwesomeIcon
                                                                                icon={
                                                                                    faThumbsUp
                                                                                }
                                                                            />
                                                                        </span>
                                                                        <span className="flex items-center align-middle text-center leading-[1rem] text-text">
                                                                            {
                                                                                reply
                                                                                    .likes
                                                                                    .length
                                                                            }
                                                                        </span>
                                                                    </button>
                                                                )}
                                                                {reply.dislikes.some(
                                                                    (dislike) =>
                                                                        dislike.author ===
                                                                        userData.username
                                                                ) ? (
                                                                    <button
                                                                        onClick={() => {
                                                                            dislikeReply(
                                                                                comment._id,
                                                                                reply._id,
                                                                                event
                                                                            );
                                                                        }}
                                                                        className="py-2 px-3 border-l-0 rounded-r-full flex gap-3 items-center align-middle text-center text-md text-secondary hover:bg-cardButtonBg"
                                                                    >
                                                                        <span className="flex items-center align-middle text-center">
                                                                            <FontAwesomeIcon
                                                                                icon={
                                                                                    faThumbsDownSolid
                                                                                }
                                                                            />
                                                                        </span>
                                                                        <span className="flex items-center align-middle text-center leading-[1rem] text-text">
                                                                            {
                                                                                reply
                                                                                    .dislikes
                                                                                    .length
                                                                            }
                                                                        </span>
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => {
                                                                            dislikeReply(
                                                                                comment._id,
                                                                                reply._id,
                                                                                event
                                                                            );
                                                                        }}
                                                                        className="py-2 px-3 border-l-0 rounded-r-full flex gap-3 items-center align-middle text-center text-md text-text hover:bg-cardButtonBg"
                                                                    >
                                                                        <span className="flex items-center align-middle text-center">
                                                                            <FontAwesomeIcon
                                                                                icon={
                                                                                    faThumbsDown
                                                                                }
                                                                            />
                                                                        </span>
                                                                        <span className="flex items-center align-middle text-center leading-[1rem] text-text">
                                                                            {
                                                                                reply
                                                                                    .dislikes
                                                                                    .length
                                                                            }
                                                                        </span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {isAuthenticated &&
                                                        reply.author ===
                                                            userData.username ? (
                                                            <button
                                                                onClick={() => {
                                                                    setReplyToDelete(
                                                                        {
                                                                            commentId:
                                                                                comment._id,
                                                                            replyId:
                                                                                reply._id,
                                                                            postId: id,
                                                                            replyAuthor:
                                                                                reply.author,
                                                                        }
                                                                    );
                                                                }}
                                                                className="py-1 px-3 flex gap-3 items-center align-middle text-center text-md text-text hover:cursor-pointer hover:bg-cardButtonBg rounded-full"
                                                            >
                                                                <span className="flex items-center justify-center text-sm leading-[1rem] h-6 align-middle">
                                                                    <FontAwesomeIcon
                                                                        icon={
                                                                            faTrashCan
                                                                        }
                                                                    />
                                                                </span>
                                                                <span className="text-md text-center items-center font-medium h-[1.65rem]">
                                                                    Delete
                                                                </span>
                                                            </button>
                                                        ) : (
                                                            ""
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex text-center mt-[2rem] gap-4 mb-[2rem] font-light justify-center text-placeholderText">
                        <div className="flex justify-center items-center">
                            <FontAwesomeIcon
                                icon={faCommentSlash}
                                className="text-[2rem] text-placeholderText"
                            />
                        </div>
                        <div className="flex flex-col gap-1 text-left text-light">
                            <div>No comments on this post yet.</div>
                            <div className="font-semibold">
                                {userData.username ? (
                                    "Be first to comment!"
                                ) : (
                                    <button
                                        onClick={() => {
                                            navigate("/register");
                                        }}
                                        className="hover:underline decoration-2 decoration-accent underline-offset-2"
                                    >
                                        Log in or sign up to comment!
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

// create reply via endpoint and reset form data
const onSubmitFunction = (
    replyData,
    commentId,
    id,
    setNewReply,
    getComments
) => {
    const createReplyURL = `http://localhost:8000/comments/create-reply/${id}/${commentId}`;
    axios
        .post(createReplyURL, replyData, {
            withCredentials: true,
        })
        .then((res) => {
            // re-render comments to include the newly create comment
            getComments();
            // reset input values to empty
            setNewReply({
                content: "",
                author: newReply.author,
            });
        })
        .catch((err) => {
            console.log(err);
        });
};

export default PostDetails;
