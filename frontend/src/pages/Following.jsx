import React from "react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ConfirmDeletePostWindow from "../components/ConfirmDeletePostWindow";
import axios from "axios";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faNoteSticky,
    faMessage,
    faThumbsUp,
    faThumbsDown,
    faTrashCan,
    faBookmark,
    faCopy,
} from "@fortawesome/free-regular-svg-icons";
import {
    faCheck,
    faChevronDown,
    faCompass,
    faEllipsis,
    faBookmark as faBookmarkSolid,
    faThumbsDown as faThumbsDownSolid,
    faThumbsUp as faThumbsUpSolid,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

// Page: Following
// displays all following forum posts
// users can copy post links, save/unsave posts, like/dislike posts, delete owned posts
const Following = ({
    currentSortOptionFollowing,
    setCurrentSortOptionFollowing,
    setGlobalNotificationMessages,
    globalNotificationMessages,
    userData,
    setUserData,
}) => {
    // frontend URL base for copying forum post links
    const URLFrontEndBase = "http://localhost:5173";
    // backend URL
    const baseURL = "http://localhost:8000";
    // backend endpoint for user authentication
    const checkAuthURL = `${baseURL}/users/protected-route`;
    // useState hook to store forum posts
    const [forumPosts, setForumPosts] = useState([]);
    // useState hook to handle sort dropdown display
    const [isSortDisplayed, setIsSortDisplayed] = useState(false);
    // useState hook to handle post options dropdown display
    const [isPostOptionsDisplayed, setIsPostOptionsDisplayed] = useState(false);
    // useState hook to handle post options dropdown display for multiple posts
    const [postOptionsBooleanArray, setPostOptionsBooleanArray] = useState([]);
    // useState hook to handle displaying one options dropdown menu at a time
    const [activePostOptionsDisplayed, setActivePostOptionsDisplayed] =
        useState([]);
    // useState hook to handle copy link confirmation, mainly for UX purposes
    const [postLinkCopied, setPostLinkCopied] = useState(false);
    // useState hook to confirm forum posts retrieval
    const [retrievedForumPosts, setRetrievedForumPosts] = useState(null);
    // navigation hook
    const navigate = useNavigate();
    // useRef hooks to handle sort dropdown menu open/close states
    // clicks outside dropdown will close it
    const sortDropdownListRef = useRef(null);
    const sortDropdownButtonRef = useRef(null);
    // useState hook to disable button while save request is processing
    const [savingPost, setSavingPost] = useState(false);
    // useRef hooks to handle post options dropdown menus open/close states
    // clicks outside dropdown will close it
    const postOptionsDropdownButtonRef = useRef([]);
    const postOptionsDropdownListRef = useRef([]);
    // useState hook to disable button while delete request is processing
    const [deletingUserPost, setDeletingUserPost] = useState(false);
    // useState hook to store post data that is to be deleted
    const [postToDelete, setPostToDelete] = useState(null);
    // useState hook to show/hide delete post confirmation window
    const [showDeletePostWindow, setShowDeletePostWindow] = useState(false);
    // useState hook to store post id that is to be deleted
    const [postToDeleteId, setPostToDeleteId] = useState(null);
    // useState hook that is set true if a user has no following posts
    const [noFollowingPosts, setNoFollowingPosts] = useState(null);

    // pushes a button reference to postOptionsDropdownButtonRef for every forum post
    const addPostOptionsDropdownButtonToArray = (element) => {
        if (
            element &&
            !postOptionsDropdownButtonRef.current.includes(element)
        ) {
            postOptionsDropdownButtonRef.current.push(element);
        }
    };

    // pushes a list (div) reference to addPostOptionsDropdownListToArray for every forum post
    const addPostOptionsDropdownListToArray = (element) => {
        if (element && !postOptionsDropdownListRef.current.includes(element)) {
            postOptionsDropdownListRef.current.push(element);
        }
    };

    // GET userData, set isAuthenticated, set author value for new post
    const checkAuth = () => {
        axios
            .get(checkAuthURL, { withCredentials: true })
            .then((res) => {
                setUserData(res.data.user);
            })
            .catch((err) => {
                console.log("User not authenticated", err);
            });
    };

    // if userData is defined, check if length > 0, if so getForumPosts
    // useEffect hook to refresh forum posts if userData is changed
    useEffect(() => {
        if (userData) {
            const userDataLength = Object.keys(userData).length;
            if (userDataLength > 0) getForumPosts(currentSortOptionFollowing);
        }
    }, [userData]);

    // useEffect hook to sort forum posts when sort value is changed
    useEffect(() => {
        getForumPosts(currentSortOptionFollowing);
    }, [currentSortOptionFollowing]);

    // reorders elements in an array based on a given array of indices
    // ex: reorderArray(['a', 'b', 'c'], [2, 0, 1]) returns ['c', 'a', 'b']
    const reorderArray = (arr, indices) => {
        const result = [];
        for (let i = 0; i < indices.length; i++) {
            result[i] = arr[indices[i]];
        }
        return result;
    };

    // retrieves forum posts from endpoint and sorts them based on current sort value
    // posts are filtered to show only following posts
    const getForumPosts = async (currentSortOptionFollowing) => {
        const getPostsURL = "http://localhost:8000/forum-posts";
        try {
            const res = await axios.get(getPostsURL);
            let postsTemp = res.data;
            let posts = [];
            if (userData.following.length > 0) {
                userData.following.forEach((user) => {
                    postsTemp.forEach((post) => {
                        if (post.author === user.username) {
                            posts.push(post);
                        }
                    });
                });
            }
            if (posts.length === 0) {
                setNoFollowingPosts(true);
            } else {
                setNoFollowingPosts(false);
            }
            let likesAndIndexArray = [];
            let indicesArray = [];
            let sortedArray = [];
            switch (currentSortOptionFollowing) {
                case "New":
                    posts = posts.reverse();
                    break;
                case "Old":
                    posts = posts;
                    break;

                case "Top":
                    posts.forEach((post) => {
                        likesAndIndexArray.push([
                            post.likes.length,
                            posts.indexOf(post),
                        ]);
                    });
                    sortedArray = likesAndIndexArray.sort(function (a, b) {
                        return b[0] - a[0];
                    });

                    sortedArray.forEach((element) => {
                        indicesArray.push(element.splice(1, 1));
                    });
                    posts = reorderArray(posts, indicesArray);
                    break;

                case "Bottom":
                    likesAndIndexArray = [];
                    posts.forEach((post) => {
                        likesAndIndexArray.push([
                            post.dislikes.length,
                            posts.indexOf(post),
                        ]);
                    });
                    sortedArray = likesAndIndexArray.sort(function (a, b) {
                        return b[0] - a[0];
                    });
                    indicesArray = [];
                    sortedArray.forEach((element) => {
                        indicesArray.push(element.splice(1, 1));
                    });
                    posts = reorderArray(posts, indicesArray);

                    break;
            }
            setRetrievedForumPosts(true);
            setForumPosts(posts);
            getForumPostsIds(posts);
            setDeletingUserPost(false);
            setPostToDelete();
        } catch (error) {
            setRetrievedForumPosts(false);
            console.error("Error fetching data:", error);
        }
    };

    // tracks the visibility of each post's options dropdown by creating an array of post IDs and visibility states
    const getForumPostsIds = (posts) => {
        let postIDsArray = [];
        let postOptionsBooleanArrayTemp = [];
        posts.forEach((post) => {
            postIDsArray.push(post._id);
            postOptionsBooleanArrayTemp.push({
                postId: post._id,
                shown: false,
            });
        });
        setPostOptionsBooleanArray(postOptionsBooleanArrayTemp);
    };

    // listens for mousedown events and executes handleClickOutsideSort()
    // handles visibility of the sort dropdown menu
    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutsideSort);

        return () => {
            document.removeEventListener("mousedown", handleClickOutsideSort);
        };
    }, []);

    // listens for mousedown events and executes handleClickOutsidePostOptions()
    // handles visibility of the post options dropdown menu
    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutsidePostOptions);
        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutsidePostOptions
            );
        };
    });

    // dislike post using backend endpoint
    // refreshes post data to reflect the change
    const dislikePost = (postId, event) => {
        if (userData == "") {
            navigate("/register");
        } else {
            event.preventDefault();
            const author = { author: userData.username };
            axios
                .post(`${baseURL}/forum-posts/dislike-post/${postId}`, author, {
                    withCredentials: true,
                })
                .then(() => {
                    console.log("Post disliked. Re-rendering post information");
                    getForumPosts(currentSortOptionFollowing);
                })
                .catch((err) => console.log(err));
        }
    };

    // like post using backend endpoint
    // refreshes post data to reflect the change
    const likePost = (postId, event) => {
        if (userData == "") {
            navigate("/register");
        } else {
            event.preventDefault();
            const author = { author: userData.username };
            axios
                .post(`${baseURL}/forum-posts/like-post/${postId}`, author, {
                    withCredentials: true,
                })
                .then(() => {
                    console.log("Post liked. Re-rendering post information");
                    getForumPosts(currentSortOptionFollowing);
                })
                .catch((err) => console.log(err));
        }
    };

    // shows/hides sort dropdown menu and hides all post options menus
    const handleShowHideSort = () => {
        setIsSortDisplayed(!isSortDisplayed);
        const updatedArray = [...postOptionsBooleanArray];
        updatedArray.forEach((element) => {
            element.shown = false;
        });
        setPostOptionsBooleanArray(updatedArray);
    };

    // clicking outside the sort dropdown menu will hide it
    const handleClickOutsideSort = (event) => {
        if (
            !sortDropdownListRef.current.contains(event.target) &&
            !sortDropdownButtonRef.current.contains(event.target)
        ) {
            setIsSortDisplayed(false);
        }
    };

    // handles visibility of post options dropdown menu on button click
    // ensures only one menu is visible at a time
    const handleShowHidePostOptions = (postId) => {
        setIsPostOptionsDisplayed(!isPostOptionsDisplayed);

        postOptionsBooleanArray.forEach((element) => {
            if (element.postId === postId) {
                const updatedArray = [...postOptionsBooleanArray];
                const index = updatedArray.findIndex(
                    (item) => item.postId === postId
                );

                if (activePostOptionsDisplayed) {
                    if (activePostOptionsDisplayed === index) {
                    } else {
                        updatedArray[activePostOptionsDisplayed] = {
                            ...updatedArray[activePostOptionsDisplayed],
                            shown: false,
                        };
                        setPostLinkCopied(false);
                    }
                } else {
                    if (activePostOptionsDisplayed === index) {
                        // do nothing
                    } else {
                        // make all false
                        updatedArray.forEach((element) => {
                            element.shown = false;
                        });
                    }
                }

                updatedArray[index] = {
                    ...updatedArray[index],
                    shown: !element.shown,
                };

                setActivePostOptionsDisplayed(index);
                setPostOptionsBooleanArray(updatedArray);
            }
        });
    };

    // handles visibility of post options dropdown menu when clicking outside menu
    const handleClickOutsidePostOptions = (event) => {
        // find closest button element
        const clickedElement = event.target.closest("button");

        if (
            (clickedElement && clickedElement.id === "postOptionsMenuButton") ||
            (clickedElement && clickedElement.id === "postOptionsButton")
        ) {
            // do nothing
        } else {
            const updatedArray = [...postOptionsBooleanArray];
            updatedArray.forEach((element) => {
                element.shown = false;
            });
            setPostOptionsBooleanArray(updatedArray);
            setPostLinkCopied(false);
        }
    };

    // hides a post options dropdown menu; executed when interacting with the dropdown (ex: save post)
    const resetAllPostOptionBooleans = (postId) => {
        postOptionsBooleanArray.forEach((element) => {
            if (element.postId === postId) {
                const updatedArray = [...postOptionsBooleanArray];
                const index = updatedArray.findIndex(
                    (item) => item.postId === postId
                );

                updatedArray[index] = {
                    ...updatedArray[index],
                    shown: !element.shown,
                };

                setPostOptionsBooleanArray(updatedArray);
            }
        });
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
                console.log("Post saved successfully");
                addMessage("Successfully saved post.");
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
                            console.log("Removed saved post successfully");
                            addMessage("Successfully removed saved post.");
                            setSavingPost(false);
                            checkAuth();
                        })
                        .catch((err) => {
                            console.log(err);
                            addMessage("Could not remove saved post.");
                        });
                } else {
                    console.log(err, "Something went wrong.");
                    addMessage("Could not save post.");
                }
            });
    };

    // generate unique id values for global notifications
    // required for notifications to expire independently (setTimeout)
    const generateUniqueId = () => {
        let id;
        do {
            id = Math.floor(Math.random() * 100000);
        } while (
            globalNotificationMessages.some((message) => message.id === id)
        );
        return id;
    };

    // function to create global notifications; passed a msg value
    const addMessage = (msg) => {
        const newMessage = { id: generateUniqueId(), text: msg };
        const newMessages = [...globalNotificationMessages, newMessage];
        setGlobalNotificationMessages(newMessages);
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

    // handles display of following forum posts in 3 cases
    // 1. no following post and you are not following any users, return appropriate message
    // 2. no following post and you are following users, return appropriate message
    // 3. there are following post and you are following users, return posts
    const displayPosts = () => {
        if (noFollowingPosts && userData.following.length <= 0) {
            return (
                <div className="flex flex-col items-center justify-center gap-1 mt-10 text-text">
                    <div className="text-base text-center mx-5">
                        You’re not following anyone yet!
                    </div>
                    <div className="text-base text-center mx-5">
                        Start following users to see their posts here.
                    </div>
                </div>
            );
        } else if (noFollowingPosts && userData.following.length > 0) {
            return (
                <div className="flex flex-col items-center justify-center gap-5 mt-10 text-text">
                    <div className="text-base text-center mx-5">
                        You’re following some great users, but they haven’t
                        posted anything yet!
                    </div>
                    <div className="text-base text-center mx-5">
                        Check back soon for updates.
                    </div>
                </div>
            );
        } else if (!noFollowingPosts) {
            return (
                <div className="flex flex-col gap-2 mt-2">
                    {forumPosts.map((forumPost, index) => {
                        let repliesCount = 0;
                        forumPost.comments.map((comment) => {
                            repliesCount += comment.replies.length;
                        });
                        if (index === forumPosts.length - 1) {
                            return (
                                <div
                                    key={index}
                                    className={
                                        deletingUserPost &&
                                        postToDelete === forumPost._id
                                            ? `animate-pulse`
                                            : ""
                                    }
                                >
                                    <div>
                                        <div
                                            className={`rounded-xl p-3 flex flex-col gap-1 hover:bg-cardBg ${
                                                deletingUserPost
                                                    ? "hover:cursor-default"
                                                    : "hover:cursor-pointer"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex gap-[0.35rem] leading-[1rem] align-middle items-center text-center h-full p-[0.22rem]">
                                                    <span>
                                                        <FontAwesomeIcon
                                                            className="text-sm text-accent"
                                                            icon={faNoteSticky}
                                                        />
                                                    </span>
                                                    <span className="text-offText font-light text-sm flex flex-col justify-center leading-6">
                                                        by
                                                    </span>
                                                    <span>
                                                        <Link
                                                            to={`/user/${forumPost.author}`}
                                                            className="hover:underline decoration-2 decoration-accent underline-offset-2 text-offText text-sm font-semibold"
                                                        >
                                                            {forumPost.author}
                                                        </Link>
                                                    </span>
                                                    <span className="text-offText font-light text-sm flex flex-col justify-center leading-6">
                                                        •
                                                    </span>
                                                    <span className="text-offText font-light text-sm flex flex-col justify-center leading-6">
                                                        {moment(
                                                            forumPost.created_at
                                                        ).fromNow()}
                                                    </span>
                                                </div>
                                                <div
                                                    onClick={() =>
                                                        navigate(
                                                            `/forum-post/${forumPost._id}`
                                                        )
                                                    }
                                                    className="flex-grow h-full text-transparent p-[0.22rem]"
                                                >
                                                    .
                                                </div>
                                                <div className="" dir="rtl">
                                                    <button
                                                        id="postOptionsMenuButton"
                                                        ref={
                                                            addPostOptionsDropdownButtonToArray
                                                        }
                                                        onClick={(element) => {
                                                            handleShowHidePostOptions(
                                                                forumPost._id
                                                            );
                                                        }}
                                                        className={`flex items-center justify-center rounded-full hover:bg-border p-[0.35rem] ${
                                                            postOptionsBooleanArray.some(
                                                                (element) =>
                                                                    element.postId ===
                                                                        forumPost._id &&
                                                                    element.shown ===
                                                                        true
                                                            ) === true
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
                                                        ref={
                                                            addPostOptionsDropdownListToArray
                                                        }
                                                        className={
                                                            postOptionsBooleanArray.some(
                                                                (element) =>
                                                                    element.postId ===
                                                                        forumPost._id &&
                                                                    element.shown ===
                                                                        true
                                                            ) === true
                                                                ? "flex flex-col border border-border rounded-xl absolute w-fit overflow-hidden bg-background text-sm animate-slideDown"
                                                                : "hidden"
                                                        }
                                                    >
                                                        <button
                                                            id="postOptionsButton"
                                                            onClick={() => {
                                                                copyPostLink(
                                                                    forumPost._id
                                                                );
                                                            }}
                                                            className={`h-12 flex justify-end items-center gap-3 px-5 text-md hover:bg-border ${
                                                                postLinkCopied
                                                                    ? "text-accent"
                                                                    : "text-offText"
                                                            }`}
                                                        >
                                                            {postLinkCopied
                                                                ? "Copied URL"
                                                                : "Copy URL"}
                                                            <FontAwesomeIcon
                                                                icon={
                                                                    postLinkCopied
                                                                        ? faCheck
                                                                        : faCopy
                                                                }
                                                                className="text-lg w-5 h-5"
                                                            />
                                                        </button>
                                                        {userData !== null &&
                                                        userData.length !==
                                                            0 ? (
                                                            <button
                                                                id="postOptionsButton"
                                                                onClick={() => {
                                                                    savePostToUserProfile(
                                                                        forumPost._id
                                                                    );
                                                                }}
                                                                className="h-12 flex justify-end items-center gap-3 px-5 text-md text-offText hover:bg-border"
                                                                disabled={
                                                                    savingPost
                                                                        ? true
                                                                        : false
                                                                }
                                                            >
                                                                {userData.savedPosts.includes(
                                                                    String(
                                                                        forumPost._id
                                                                    )
                                                                )
                                                                    ? "Remove from saved"
                                                                    : "Save"}
                                                                {userData.savedPosts.includes(
                                                                    String(
                                                                        forumPost._id
                                                                    )
                                                                ) ? (
                                                                    <FontAwesomeIcon
                                                                        icon={
                                                                            faBookmarkSolid
                                                                        }
                                                                        className="text-lg w-5 h-5 text-accent"
                                                                    />
                                                                ) : (
                                                                    <FontAwesomeIcon
                                                                        icon={
                                                                            faBookmark
                                                                        }
                                                                        className="text-lg w-5 h-5"
                                                                    />
                                                                )}
                                                            </button>
                                                        ) : (
                                                            ""
                                                        )}

                                                        {userData.username ===
                                                        forumPost.author ? (
                                                            <button
                                                                id="postOptionsButton"
                                                                onClick={() => {
                                                                    setPostToDeleteId(
                                                                        forumPost._id
                                                                    );
                                                                    setShowDeletePostWindow(
                                                                        !showDeletePostWindow
                                                                    );
                                                                    resetAllPostOptionBooleans(
                                                                        forumPost._id
                                                                    );
                                                                }}
                                                                className="h-12 flex justify-end items-center gap-3 px-5 text-md text-offText hover:brightness-125 bg-accent"
                                                            >
                                                                Delete
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        faTrashCan
                                                                    }
                                                                    className="text-lg w-5 h-5"
                                                                />
                                                            </button>
                                                        ) : (
                                                            ""
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                className="flex flex-col gap-2"
                                                onClick={() => {
                                                    navigate(
                                                        `/forum-post/${forumPost._id}`
                                                    );
                                                }}
                                            >
                                                <div className="text-xl font-semibold text-text">
                                                    {forumPost.title}
                                                </div>
                                                <div className="text-sm text-offText max-h-[5rem] overflow-hidden">
                                                    <pre className="text-wrap font-light">
                                                        {forumPost.content}
                                                    </pre>
                                                </div>

                                                <div className="flex gap-[0.5rem] mb-1 mt-1">
                                                    <div className="flex gap-[1.5rem] items-center w-fit font-semibold">
                                                        <div className="flex">
                                                            {forumPost.likes.some(
                                                                (like) =>
                                                                    like.author ===
                                                                    userData.username
                                                            ) ? (
                                                                <button
                                                                    className="py-2 px-3 rounded-l-full flex gap-3 items-center align-middle text-center text-md text-text bg-accent hover:text-offText group"
                                                                    onClick={(
                                                                        event
                                                                    ) => {
                                                                        event.preventDefault();
                                                                        event.stopPropagation();
                                                                        likePost(
                                                                            forumPost._id,
                                                                            event
                                                                        );
                                                                    }}
                                                                >
                                                                    <span className="flex items-center align-middle text-center group-hover:scale-110 transition-transform duration-10 ease-in-out">
                                                                        <FontAwesomeIcon
                                                                            icon={
                                                                                faThumbsUpSolid
                                                                            }
                                                                            className="animate-likeBounce "
                                                                        />
                                                                    </span>
                                                                    <span className="flex items-center align-middle text-center leading-[1rem] ">
                                                                        {
                                                                            forumPost
                                                                                .likes
                                                                                .length
                                                                        }
                                                                    </span>
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="py-2 px-3 border-r-0 rounded-l-full flex gap-3 items-center align-middle text-center text-md bg-cardButtonBg text-text hover:text-offText group"
                                                                    onClick={(
                                                                        event
                                                                    ) => {
                                                                        event.preventDefault();
                                                                        event.stopPropagation();
                                                                        likePost(
                                                                            forumPost._id,
                                                                            event
                                                                        );
                                                                    }}
                                                                >
                                                                    <span className="flex items-center align-middle text-center group-hover:scale-110 transition-transform duration-10 ease-in-out">
                                                                        <FontAwesomeIcon
                                                                            icon={
                                                                                faThumbsUp
                                                                            }
                                                                        />
                                                                    </span>
                                                                    <span className="flex items-center align-middle text-center leading-[1rem] ">
                                                                        {
                                                                            forumPost
                                                                                .likes
                                                                                .length
                                                                        }
                                                                    </span>
                                                                </button>
                                                            )}
                                                            {forumPost.dislikes.some(
                                                                (dislike) =>
                                                                    dislike.author ===
                                                                    userData.username
                                                            ) ? (
                                                                <button
                                                                    onClick={(
                                                                        event
                                                                    ) => {
                                                                        event.preventDefault();
                                                                        event.stopPropagation();
                                                                        dislikePost(
                                                                            forumPost._id,
                                                                            event
                                                                        );
                                                                    }}
                                                                    className="py-2 px-3 border-l-0 rounded-r-full flex gap-3 items-center align-middle text-center text-md text-text bg-secondary hover:text-offText group"
                                                                >
                                                                    <span className="flex items-center align-middle text-center group-hover:scale-110 transition-transform duration-10 ease-in-out">
                                                                        <FontAwesomeIcon
                                                                            icon={
                                                                                faThumbsDownSolid
                                                                            }
                                                                            className="icon icon-solid"
                                                                        />
                                                                    </span>
                                                                    <span className="flex items-center align-middle text-center leading-[1rem] ">
                                                                        {
                                                                            forumPost
                                                                                .dislikes
                                                                                .length
                                                                        }
                                                                    </span>
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={(
                                                                        event
                                                                    ) => {
                                                                        event.preventDefault();
                                                                        event.stopPropagation();
                                                                        dislikePost(
                                                                            forumPost._id,
                                                                            event
                                                                        );
                                                                    }}
                                                                    className="py-2 px-3 border-l-0 rounded-r-full flex gap-3 items-center align-middle text-center text-md text-text bg-cardButtonBg hover:text-offText group"
                                                                >
                                                                    <span className="flex items-center align-middle text-center group-hover:scale-110 transition-transform duration-10 ease-in-out">
                                                                        <FontAwesomeIcon
                                                                            icon={
                                                                                faThumbsDown
                                                                            }
                                                                            className="icon"
                                                                        />
                                                                    </span>
                                                                    <span className="flex items-center align-middle text-center leading-[1rem] ">
                                                                        {
                                                                            forumPost
                                                                                .dislikes
                                                                                .length
                                                                        }
                                                                    </span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="py-1 px-3 rounded-full flex gap-3 items-center align-middle text-center text-md text-text bg-cardButtonBg hover:cursor-pointer hover:text-offText">
                                                        <span className="flex items-center justify-center text-sm leading-[1rem]">
                                                            <FontAwesomeIcon
                                                                icon={faMessage}
                                                            />
                                                        </span>
                                                        <span className="text-md text-center items-center leading-[1rem] font-medium">
                                                            {forumPost.comments
                                                                .length +
                                                                repliesCount}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        } else {
                            return (
                                <div
                                    key={index}
                                    className={
                                        deletingUserPost &&
                                        postToDelete === forumPost._id
                                            ? `animate-pulse`
                                            : ""
                                    }
                                >
                                    <div>
                                        <div>
                                            <div
                                                className={`rounded-xl p-3 flex flex-col gap-1 hover:bg-cardBg ${
                                                    deletingUserPost
                                                        ? "hover:cursor-default"
                                                        : "hover:cursor-pointer"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex gap-[0.35rem] leading-[1rem] align-middle items-center text-center h-full p-[0.22rem]">
                                                        <span>
                                                            <FontAwesomeIcon
                                                                className="text-sm text-accent"
                                                                icon={
                                                                    faNoteSticky
                                                                }
                                                            />
                                                        </span>
                                                        <span className="text-offText font-light text-sm flex flex-col justify-center leading-6">
                                                            by
                                                        </span>
                                                        <span>
                                                            <Link
                                                                to={`/user/${forumPost.author}`}
                                                                className="hover:underline decoration-2 decoration-accent underline-offset-2 text-offText text-sm font-semibold"
                                                            >
                                                                {
                                                                    forumPost.author
                                                                }
                                                            </Link>
                                                        </span>
                                                        <span className="text-offText font-light text-sm flex flex-col justify-center leading-6">
                                                            •
                                                        </span>
                                                        <span className="text-offText font-light text-sm flex flex-col justify-center leading-6">
                                                            {moment(
                                                                forumPost.created_at
                                                            ).fromNow()}
                                                        </span>
                                                    </div>
                                                    <div
                                                        onClick={() =>
                                                            navigate(
                                                                `/forum-post/${forumPost._id}`
                                                            )
                                                        }
                                                        className="flex-grow h-full text-transparent p-[0.22rem]"
                                                    >
                                                        .
                                                    </div>
                                                    <div className="" dir="rtl">
                                                        <button
                                                            id="postOptionsMenuButton"
                                                            ref={
                                                                addPostOptionsDropdownButtonToArray
                                                            }
                                                            onClick={(
                                                                element
                                                            ) => {
                                                                handleShowHidePostOptions(
                                                                    forumPost._id
                                                                );
                                                            }}
                                                            className={`flex items-center justify-center rounded-full hover:bg-border p-[0.35rem] ${
                                                                postOptionsBooleanArray.some(
                                                                    (element) =>
                                                                        element.postId ===
                                                                            forumPost._id &&
                                                                        element.shown ===
                                                                            true
                                                                ) === true
                                                                    ? "bg-border"
                                                                    : "bg-transparent"
                                                            }`}
                                                        >
                                                            <FontAwesomeIcon
                                                                className="text-xl w-5 h-5"
                                                                icon={
                                                                    faEllipsis
                                                                }
                                                            />
                                                        </button>

                                                        <div
                                                            ref={
                                                                addPostOptionsDropdownListToArray
                                                            }
                                                            className={
                                                                postOptionsBooleanArray.some(
                                                                    (element) =>
                                                                        element.postId ===
                                                                            forumPost._id &&
                                                                        element.shown ===
                                                                            true
                                                                ) === true
                                                                    ? "flex flex-col border border-border rounded-xl absolute w-fit overflow-hidden bg-background text-sm animate-slideDown"
                                                                    : "hidden"
                                                            }
                                                        >
                                                            <button
                                                                id="postOptionsButton"
                                                                onClick={() => {
                                                                    copyPostLink(
                                                                        forumPost._id
                                                                    );
                                                                }}
                                                                className={`h-12 flex justify-end items-center gap-3 px-5 text-md hover:bg-border ${
                                                                    postLinkCopied
                                                                        ? "text-accent"
                                                                        : "text-offText"
                                                                }`}
                                                            >
                                                                {postLinkCopied
                                                                    ? "Copied URL"
                                                                    : "Copy URL"}
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        postLinkCopied
                                                                            ? faCheck
                                                                            : faCopy
                                                                    }
                                                                    className="text-lg w-5 h-5"
                                                                />
                                                            </button>
                                                            {userData !==
                                                                null &&
                                                            userData.length !==
                                                                0 ? (
                                                                <button
                                                                    id="postOptionsButton"
                                                                    onClick={() => {
                                                                        savePostToUserProfile(
                                                                            forumPost._id
                                                                        );
                                                                    }}
                                                                    className="h-12 flex justify-end items-center gap-3 px-5 text-md text-offText hover:bg-border"
                                                                    disabled={
                                                                        savingPost
                                                                            ? true
                                                                            : false
                                                                    }
                                                                >
                                                                    {userData.savedPosts.includes(
                                                                        String(
                                                                            forumPost._id
                                                                        )
                                                                    )
                                                                        ? "Remove from saved"
                                                                        : "Save"}
                                                                    {userData.savedPosts.includes(
                                                                        String(
                                                                            forumPost._id
                                                                        )
                                                                    ) ? (
                                                                        <FontAwesomeIcon
                                                                            icon={
                                                                                faBookmarkSolid
                                                                            }
                                                                            className="text-lg w-5 h-5 text-accent"
                                                                        />
                                                                    ) : (
                                                                        <FontAwesomeIcon
                                                                            icon={
                                                                                faBookmark
                                                                            }
                                                                            className="text-lg w-5 h-5"
                                                                        />
                                                                    )}
                                                                </button>
                                                            ) : (
                                                                ""
                                                            )}

                                                            {userData.username ===
                                                            forumPost.author ? (
                                                                <button
                                                                    id="postOptionsButton"
                                                                    onClick={() => {
                                                                        setPostToDeleteId(
                                                                            forumPost._id
                                                                        );
                                                                        setShowDeletePostWindow(
                                                                            !showDeletePostWindow
                                                                        );

                                                                        resetAllPostOptionBooleans(
                                                                            forumPost._id
                                                                        );
                                                                    }}
                                                                    className="h-12 flex justify-end items-center gap-3 px-5 text-md text-offText hover:brightness-125 bg-accent"
                                                                >
                                                                    Delete
                                                                    <FontAwesomeIcon
                                                                        icon={
                                                                            faTrashCan
                                                                        }
                                                                        className="text-lg w-5 h-5"
                                                                    />
                                                                </button>
                                                            ) : (
                                                                ""
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div
                                                    className="flex flex-col gap-2"
                                                    onClick={() => {
                                                        navigate(
                                                            `/forum-post/${forumPost._id}`
                                                        );
                                                    }}
                                                >
                                                    <div className="text-xl font-semibold text-text">
                                                        {forumPost.title}
                                                    </div>
                                                    <div className="text-sm text-offText max-h-[5rem] overflow-hidden">
                                                        <pre className="text-wrap font-light">
                                                            {forumPost.content}
                                                        </pre>
                                                    </div>

                                                    <div className="flex gap-[0.5rem] mb-1 mt-1">
                                                        <div className="flex gap-[1.5rem] items-center w-fit font-semibold">
                                                            <div className="flex">
                                                                {forumPost.likes.some(
                                                                    (like) =>
                                                                        like.author ===
                                                                        userData.username
                                                                ) ? (
                                                                    <button
                                                                        className="py-2 px-3 rounded-l-full flex gap-3 items-center align-middle text-center text-md text-text bg-accent hover:text-offText group"
                                                                        onClick={(
                                                                            event
                                                                        ) => {
                                                                            event.preventDefault();
                                                                            event.stopPropagation();
                                                                            likePost(
                                                                                forumPost._id,
                                                                                event
                                                                            );
                                                                        }}
                                                                    >
                                                                        <span className="flex items-center align-middle text-center group-hover:scale-110 transition-transform duration-10 ease-in-out">
                                                                            <FontAwesomeIcon
                                                                                icon={
                                                                                    faThumbsUpSolid
                                                                                }
                                                                                className="animate-likeBounce"
                                                                            />
                                                                        </span>
                                                                        <span className="flex items-center align-middle text-center leading-[1rem] ">
                                                                            {
                                                                                forumPost
                                                                                    .likes
                                                                                    .length
                                                                            }
                                                                        </span>
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        className="py-2 px-3 border-r-0 rounded-l-full flex gap-3 items-center align-middle text-center text-md bg-cardButtonBg text-text hover:text-offText group"
                                                                        onClick={(
                                                                            event
                                                                        ) => {
                                                                            event.preventDefault();
                                                                            event.stopPropagation();
                                                                            likePost(
                                                                                forumPost._id,
                                                                                event
                                                                            );
                                                                        }}
                                                                    >
                                                                        <span className="flex items-center align-middle text-center group-hover:scale-110 transition-transform duration-10 ease-in-out">
                                                                            <FontAwesomeIcon
                                                                                icon={
                                                                                    faThumbsUp
                                                                                }
                                                                            />
                                                                        </span>
                                                                        <span className="flex items-center align-middle text-center leading-[1rem] ">
                                                                            {
                                                                                forumPost
                                                                                    .likes
                                                                                    .length
                                                                            }
                                                                        </span>
                                                                    </button>
                                                                )}
                                                                {forumPost.dislikes.some(
                                                                    (dislike) =>
                                                                        dislike.author ===
                                                                        userData.username
                                                                ) ? (
                                                                    <button
                                                                        onClick={(
                                                                            event
                                                                        ) => {
                                                                            event.preventDefault();
                                                                            event.stopPropagation();
                                                                            dislikePost(
                                                                                forumPost._id,
                                                                                event
                                                                            );
                                                                        }}
                                                                        className="py-2 px-3 border-l-0 rounded-r-full flex gap-3 items-center align-middle text-center text-md text-text bg-secondary hover:text-offText group"
                                                                    >
                                                                        <span className="flex items-center align-middle text-center group-hover:scale-110 transition-transform duration-10 ease-in-out">
                                                                            <FontAwesomeIcon
                                                                                icon={
                                                                                    faThumbsDownSolid
                                                                                }
                                                                                className="icon icon-solid"
                                                                            />
                                                                        </span>
                                                                        <span className="flex items-center align-middle text-center leading-[1rem] ">
                                                                            {
                                                                                forumPost
                                                                                    .dislikes
                                                                                    .length
                                                                            }
                                                                        </span>
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={(
                                                                            event
                                                                        ) => {
                                                                            event.preventDefault();
                                                                            event.stopPropagation();
                                                                            dislikePost(
                                                                                forumPost._id,
                                                                                event
                                                                            );
                                                                        }}
                                                                        className="py-2 px-3 border-l-0 rounded-r-full flex gap-3 items-center align-middle text-center text-md text-text bg-cardButtonBg hover:text-offText group"
                                                                    >
                                                                        <span className="flex items-center align-middle text-center group-hover:scale-110 transition-transform duration-10 ease-in-out">
                                                                            <FontAwesomeIcon
                                                                                icon={
                                                                                    faThumbsDown
                                                                                }
                                                                                className="icon"
                                                                            />
                                                                        </span>
                                                                        <span className="flex items-center align-middle text-center leading-[1rem] ">
                                                                            {
                                                                                forumPost
                                                                                    .dislikes
                                                                                    .length
                                                                            }
                                                                        </span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="py-1 px-3 rounded-full flex gap-3 items-center align-middle text-center text-md text-text bg-cardButtonBg hover:cursor-pointer hover:text-offText">
                                                            <span className="flex items-center justify-center text-sm leading-[1rem]">
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        faMessage
                                                                    }
                                                                />
                                                            </span>
                                                            <span className="text-md text-center items-center leading-[1rem] font-medium">
                                                                {forumPost
                                                                    .comments
                                                                    .length +
                                                                    repliesCount}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <hr className="border-1 border-border p-0 mt-2"></hr>
                                </div>
                            );
                        }
                    })}
                </div>
            );
        }
    };

    // if retrievedForumPosts and noFollowingPosts are still null, display loading animation
    if (retrievedForumPosts === null && noFollowingPosts === null) {
        return (
            <div className="mx-auto w-full max-w-[1000px] px-auto text-wrap flex justify-center mt-10 animate-fadeInBounce">
                <FontAwesomeIcon
                    icon={faCompass}
                    className="animate-windUpSpin text-[2.5rem] text-text"
                />
            </div>
        );
    }

    // if all data has been successfully retrieved, display forum posts
    if (
        retrievedForumPosts === true &&
        Object.keys(userData).length > 0 &&
        noFollowingPosts != null
    ) {
        return (
            <>
                {showDeletePostWindow === true ? (
                    <ConfirmDeletePostWindow
                        postId={postToDeleteId}
                        getForumPosts={getForumPosts}
                        currentSortOptionFollowing={currentSortOptionFollowing}
                        setGlobalNotificationMessages={
                            setGlobalNotificationMessages
                        }
                        globalNotificationMessages={globalNotificationMessages}
                        setDeletingUserPost={setDeletingUserPost}
                        setPostToDelete={setPostToDelete}
                        baseURL={baseURL}
                        userData={userData}
                        showDeletePostWindow={showDeletePostWindow}
                        setShowDeletePostWindow={setShowDeletePostWindow}
                    />
                ) : (
                    ""
                )}

                <div className="text-wrap animate-slideDown border-border w-full lg:max-w-[800px] lg:mx-auto sm:w-[calc(100%-60px)] sm:ml-[60px]">
                    <div className="pt-2 flex justify-between items-center">
                        <div className="px-4 py-2 font-bold text-2xl">
                            Following
                        </div>
                        <div className="" dir="rtl">
                            <button
                                ref={sortDropdownButtonRef}
                                onClick={handleShowHideSort}
                                className={`hover:bg-border px-4 py-[0.5rem] rounded-full flex gap-2 items-center ${
                                    isSortDisplayed ? "bg-border" : "bg-none"
                                }`}
                            >
                                <FontAwesomeIcon
                                    icon={faChevronDown}
                                    className="text-xs"
                                />
                                <span className="text-sm">
                                    {currentSortOptionFollowing}
                                </span>
                            </button>
                            <div
                                ref={sortDropdownListRef}
                                className={
                                    isSortDisplayed
                                        ? "flex flex-col border border-border rounded-xl absolute w-[8rem] overflow-hidden bg-background text-sm animate-slideDown mt-2"
                                        : "hidden"
                                }
                            >
                                <div className="h-12 flex justify-end items-center gap-3 px-5 font-semibold text-md text-offText">
                                    Sort By
                                </div>
                                <button
                                    onClick={() => {
                                        setCurrentSortOptionFollowing("New");
                                        handleShowHideSort();
                                    }}
                                >
                                    <div
                                        className={`h-12 flex justify-end items-center text-text gap-3 px-5 hover:bg-border ${
                                            currentSortOptionFollowing === "New"
                                                ? "bg-primary hover:bg-primary"
                                                : ""
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 text-md">
                                            <div>New</div>
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => {
                                        setCurrentSortOptionFollowing("Old");
                                        handleShowHideSort();
                                    }}
                                >
                                    <div
                                        className={`h-12 flex justify-end items-center text-text gap-3 px-5 hover:bg-border ${
                                            currentSortOptionFollowing === "Old"
                                                ? "bg-primary hover:bg-primary"
                                                : ""
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 text-md">
                                            <div>Old</div>
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => {
                                        setCurrentSortOptionFollowing("Top");
                                        handleShowHideSort();
                                    }}
                                >
                                    <div
                                        className={`h-12 flex justify-end items-center text-text gap-3 px-5 hover:bg-border ${
                                            currentSortOptionFollowing === "Top"
                                                ? "bg-primary hover:bg-primary"
                                                : ""
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 text-md">
                                            <div>Top</div>
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => {
                                        setCurrentSortOptionFollowing("Bottom");
                                        handleShowHideSort();
                                    }}
                                >
                                    <div
                                        className={`h-12 flex justify-end items-center text-text gap-3 px-5 hover:bg-border ${
                                            currentSortOptionFollowing ===
                                            "Bottom"
                                                ? "bg-primary hover:bg-primary"
                                                : ""
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 text-md">
                                            <div>Bottom</div>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                    <hr className="border-1 border-border p-0 mt-2"></hr>

                    {displayPosts()}
                </div>
            </>
        );
    }

    // if the user is not logged in (no following posts), return appropriate message
    if (userData != undefined && Object.keys(userData).length === 0) {
        return (
            <div className="text-wrap animate-slideDown border-border w-full lg:max-w-[800px] lg:mx-auto sm:w-[calc(100%-60px)] sm:ml-[60px]">
                <div className="pt-2 flex justify-between items-center">
                    <div className="px-4 py-2 font-bold text-2xl">
                        Following
                    </div>
                </div>
                <hr className="border-1 border-border p-0 mt-2"></hr>
                <div className="text-center mt-10">
                    <span
                        onClick={() => {
                            navigate("/register");
                        }}
                        className="underline decoration-accent decoration-2 underline-offset-2 font-semibold hover:cursor-pointer"
                    >
                        Log In or Sign Up
                    </span>{" "}
                    to see posts from users you follow.
                </div>
            </div>
        );
    }
};

export default Following;
