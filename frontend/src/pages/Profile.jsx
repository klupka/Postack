import React, { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faNoteSticky,
    faMessage,
    faThumbsUp,
    faThumbsDown,
    faStickyNote,
    faBookmark,
    faUser as faUserRegular,
    faTrashCan,
} from "@fortawesome/free-regular-svg-icons";
import {
    faCompass,
    faUser,
    faLink,
    faThumbsDown as faThumbsDownSolid,
    faThumbsUp as faThumbsUpSolid,
    faBookmark as faBookmarkSolid,
    faCheck,
    faPencil,
    faDove,
    faKiwiBird,
    faHorse,
    faPaw,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import CustomizeProfile from "../components/CustomizeProfile";

// Page: Profile
// authenticated users can customize profile, view saved posts, their posts, and view followers/following
const Profile = ({
    setIsAuthenticated,
    showProfileCustomization,
    setShowProfileCustomization,
    globalNotificationMessages,
    setGlobalNotificationMessages,
    baseURL,
    baseURLFrontend,
}) => {
    // useState hook to store user data
    const [userData, setUserData] = useState(null);
    // useState hook to store user post data
    const [userPosts, setUserPosts] = useState(null);
    // useState hook to store user posts statistics
    const [userPostsStats, setUserPostsStats] = useState({
        numOfPosts: 0,
        numOfLikes: 0,
        numOfDislikes: 0,
    });
    // useState hook to handle copy link confirmation, mainly for UX purposes
    const [profileLinkCopied, setProfileLinkCopied] = useState(false);
    // navigation hook
    const navigate = useNavigate();
    // useState hook to handle view states for profile tab navigation
    const [activeTab, setActiveTab] = useState("posts");
    // useState hook to store users' saved posts
    const [savedPosts, setSavedPosts] = useState([]);
    // useState hook to disable remove saved post button while request is processing
    const [removingSavedPost, setRemovingSavedPost] = useState(false);
    // useState hook to store post data that is to be removed
    const [postToRemove, setPostToRemove] = useState();
    // useState hook to handle visibility of the delete profile confirmation window
    const [showDeleteProfile, setShowDeleteProfile] = useState(false);

    // GET user post data via endpoint
    const getUserPosts = () => {
        axios
            .get(`${baseURL}/users/user-posts`, {
                withCredentials: true,
            })
            .then((res) => {
                setUserPosts(res.data);
                getTotalPosts(res.data);
            })
            .catch((err) => {
                setUserPosts(null);
                console.log("Unable to retrieved user posts", err);
            });
    };

    // GET user data via endpoint
    const getUser = () => {
        axios
            .get(`${baseURL}/users/protected-route`, {
                withCredentials: true,
            })
            .then((res) => {
                setUserData(res.data.user);
                getUserPosts();
                getSavedPosts(res.data.user.username);
            })
            .catch((err) => {
                console.log("Login failed: ", err);
                navigate("/login");
            });
    };

    // calculates user post statistics
    const getTotalPosts = (posts) => {
        let totalLikes = 0;
        let totalDislikes = 0;
        posts.forEach((post) => {
            totalLikes += post.likes.length;
            totalDislikes += post.dislikes.length;
        });

        setUserPostsStats({
            numOfPosts: posts.length,
            numOfLikes: totalLikes,
            numOfDislikes: totalDislikes,
        });
    };

    // on load: get user data
    useEffect(() => {
        getUser();
    }, []);

    // copy link to user profile, temporarily shows 'copied' instead of 'copy'
    const copyProfileLink = () => {
        navigator.clipboard.writeText(
            `${baseURLFrontend}/user/${userData.username}`
        );
        setProfileLinkCopied(true);
        setTimeout(function () {
            setProfileLinkCopied(false);
        }, 2000);
    };

    // set new user customization: profile icon
    const profileIcon = (user) => {
        if (user) {
            const icon = user.profileCustomization[0].icon;
            switch (icon) {
                case "user":
                    return (
                        <FontAwesomeIcon
                            icon={faUser}
                            className="w-[60%] h-[60%]"
                        />
                    );
                case "dove":
                    return (
                        <FontAwesomeIcon
                            icon={faDove}
                            className="w-[60%] h-[60%]"
                        />
                    );
                case "kiwiBird":
                    return (
                        <FontAwesomeIcon
                            icon={faKiwiBird}
                            className="w-[60%] h-[60%]"
                        />
                    );
                case "horse":
                    return (
                        <FontAwesomeIcon
                            icon={faHorse}
                            className="w-[60%] h-[60%]"
                        />
                    );
                case "paw":
                    return (
                        <FontAwesomeIcon
                            icon={faPaw}
                            className="w-[60%] h-[60%]"
                        />
                    );
                default:
                    return (
                        <FontAwesomeIcon
                            icon={faUser}
                            className="w-[60%] h-[60%]"
                        />
                    );
            }
        }
    };

    // set new user customization: profile color
    const profileColor = (user) => {
        if (user) {
            const color = user.profileCustomization[0].color;
            switch (color) {
                case "red":
                    return "bg-red-500";
                case "orange":
                    return "bg-orange-500";
                case "yellow":
                    return "bg-yellow-500";
                case "green":
                    return "bg-green-500";
                case "blue":
                    return "bg-blue-500";
                case "violet":
                    return "bg-violet-500";
                default:
                    return "bg-primary";
            }
        }
    };

    // GET users saved post data via endpoint
    const getSavedPosts = (username) => {
        axios
            .get(`${baseURL}/forum-posts/saved-posts/${username}`)
            .then((res) => {
                setSavedPosts(res.data);
                // getSavedPosts is executed when successfully removing a saved post
                setRemovingSavedPost(false);
                setPostToRemove();
            })
            .catch((err) => {
                console.log("Failed to fetch saved posts", err);
                setRemovingSavedPost(false);
            });
    };

    // handles display posts created by user in 2 cases
    // 1. if the active tab is 'posts' and the user posts > 0, return user posts
    // 2. if the active tab  is 'posts', but the user has no posts, return appropriate message
    const displayPosts = () => {
        if (activeTab === "posts" && userPosts.length > 0) {
            return (
                <div className="forum-post-cards mt-[1rem] flex flex-col gap-5 animate-slideDown">
                    {userPosts.map((forumPost, index) => {
                        let repliesCount = 0;
                        forumPost.comments.map((comment) => {
                            repliesCount += comment.replies.length;
                        });
                        return (
                            <div key={index}>
                                <div>
                                    <div className="rounded-xl p-3 flex flex-col gap-4 bg-cardBg hover:bg-cardBgHover hover:cursor-pointer">
                                        <div className="flex gap-[0.35rem] h-[1rem] leading-[1rem] align-middle items-center text-center">
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
                                            className="flex flex-col gap-4"
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

                                            <div className="flex gap-[0.5rem] mb-1">
                                                <div className="flex gap-[1.5rem] items-center w-fit font-semibold">
                                                    <div className="flex">
                                                        {forumPost.likes.some(
                                                            (like) =>
                                                                like.author ===
                                                                userData.username
                                                        ) ? (
                                                            <button className="py-2 px-3 rounded-l-full flex gap-3 items-center align-middle text-center text-md text-text bg-accent hover:text-offText">
                                                                <span className="flex items-center align-middle text-center">
                                                                    <FontAwesomeIcon
                                                                        icon={
                                                                            faThumbsUpSolid
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
                                                        ) : (
                                                            <button className="py-2 px-3 border-r-0 rounded-l-full flex gap-3 items-center align-middle text-center text-md bg-cardButtonBg text-text hover:text-offText">
                                                                <span className="flex items-center align-middle text-center">
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
                                                            <button className="py-2 px-3 border-l-0 rounded-r-full flex gap-3 items-center align-middle text-center text-md text-text bg-secondary hover:text-offText">
                                                                <span className="flex items-center align-middle text-center">
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
                                                            <button className="py-2 px-3 border-l-0 rounded-r-full flex gap-3 items-center align-middle text-center text-md text-text bg-cardButtonBg hover:text-offText">
                                                                <span className="flex items-center align-middle text-center">
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
                    })}
                </div>
            );
        } else if (activeTab === "posts" && userPosts.length <= 0) {
            return (
                <div className="mt-10 flex flex-col gap-2">
                    <FontAwesomeIcon className="text-2xl" icon={faStickyNote} />
                    <div className="flex justify-center text-offText animate-slideDown">{`You have not posted yet.`}</div>
                </div>
            );
        }
    };

    // handles display posts saved by user in 2 cases
    // 1. if the active tab is 'saved' and the users' saved posts > 0, return users' saved posts
    // 2. if the active tab  is 'saved', but the user has no saved posts, return appropriate message
    const displaySavedPosts = () => {
        if (activeTab === "saved" && savedPosts.length > 0) {
            return (
                <div className="forum-post-cards mt-[1rem] flex flex-col gap-5 animate-slideDown">
                    {savedPosts.map((savedPost, index) => {
                        let repliesCount = 0;
                        savedPost.comments.map((comment) => {
                            repliesCount += comment.replies.length;
                        });
                        return (
                            <div
                                key={index}
                                className={
                                    removingSavedPost &&
                                    postToRemove === savedPost._id
                                        ? `animate-pulse`
                                        : ""
                                }
                            >
                                <div>
                                    <div
                                        className={`rounded-xl p-3 flex flex-col gap-4 bg-cardBg hover:bg-cardBgHover ${
                                            removingSavedPost
                                                ? "hover:cursor-default"
                                                : "hover:cursor-pointer"
                                        }`}
                                    >
                                        <div className="flex gap-[0.35rem] h-[1rem] leading-[1rem] align-middle items-center text-center">
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
                                                    to={
                                                        removingSavedPost
                                                            ? "/"
                                                            : `/user/${savedPost.author}`
                                                    }
                                                    className={`hover:underline decoration-2 decoration-accent underline-offset-2 text-offText text-sm font-semibold`}
                                                >
                                                    {savedPost.author}
                                                </Link>
                                            </span>
                                            <span className="text-offText font-light text-sm flex flex-col justify-center leading-6">
                                                •
                                            </span>
                                            <span className="text-offText font-light text-sm flex flex-col justify-center leading-6">
                                                {moment(
                                                    savedPost.created_at
                                                ).fromNow()}
                                            </span>
                                        </div>
                                        <div
                                            className="flex flex-col gap-4"
                                            onClick={() => {
                                                navigate(
                                                    `/forum-post/${savedPost._id}`
                                                );
                                            }}
                                        >
                                            <div className="text-xl font-semibold text-text">
                                                {savedPost.title}
                                            </div>
                                            <div className="text-sm text-offText max-h-[5rem] overflow-hidden">
                                                <pre className="text-wrap font-light">
                                                    {savedPost.content}
                                                </pre>
                                            </div>
                                        </div>
                                        <div className="flex  items-center pb-1">
                                            <div
                                                onClick={() => {
                                                    navigate(
                                                        `/forum-post/${savedPost._id}`
                                                    );
                                                }}
                                                className="flex gap-[0.5rem] justify-between"
                                            >
                                                <div className="flex gap-[1.5rem] items-center w-fit font-semibold">
                                                    <div className="flex">
                                                        {savedPost.likes.some(
                                                            (like) =>
                                                                like.author ===
                                                                userData.username
                                                        ) ? (
                                                            <button className="py-2 px-3 rounded-l-full flex gap-3 items-center align-middle text-center text-md text-text bg-accent hover:text-offText">
                                                                <span className="flex items-center align-middle text-center">
                                                                    <FontAwesomeIcon
                                                                        icon={
                                                                            faThumbsUpSolid
                                                                        }
                                                                    />
                                                                </span>
                                                                <span className="flex items-center align-middle text-center leading-[1rem] ">
                                                                    {
                                                                        savedPost
                                                                            .likes
                                                                            .length
                                                                    }
                                                                </span>
                                                            </button>
                                                        ) : (
                                                            <button className="py-2 px-3 border-r-0 rounded-l-full flex gap-3 items-center align-middle text-center text-md bg-cardButtonBg text-text hover:text-offText">
                                                                <span className="flex items-center align-middle text-center">
                                                                    <FontAwesomeIcon
                                                                        icon={
                                                                            faThumbsUp
                                                                        }
                                                                    />
                                                                </span>
                                                                <span className="flex items-center align-middle text-center leading-[1rem] ">
                                                                    {
                                                                        savedPost
                                                                            .likes
                                                                            .length
                                                                    }
                                                                </span>
                                                            </button>
                                                        )}
                                                        {savedPost.dislikes.some(
                                                            (dislike) =>
                                                                dislike.author ===
                                                                userData.username
                                                        ) ? (
                                                            <button className="py-2 px-3 border-l-0 rounded-r-full flex gap-3 items-center align-middle text-center text-md text-text bg-secondary hover:text-offText">
                                                                <span className="flex items-center align-middle text-center">
                                                                    <FontAwesomeIcon
                                                                        icon={
                                                                            faThumbsDownSolid
                                                                        }
                                                                        className="icon icon-solid"
                                                                    />
                                                                </span>
                                                                <span className="flex items-center align-middle text-center leading-[1rem] ">
                                                                    {
                                                                        savedPost
                                                                            .dislikes
                                                                            .length
                                                                    }
                                                                </span>
                                                            </button>
                                                        ) : (
                                                            <button className="py-2 px-3 border-l-0 rounded-r-full flex gap-3 items-center align-middle text-center text-md text-text bg-cardButtonBg hover:text-offText">
                                                                <span className="flex items-center align-middle text-center">
                                                                    <FontAwesomeIcon
                                                                        icon={
                                                                            faThumbsDown
                                                                        }
                                                                        className="icon"
                                                                    />
                                                                </span>
                                                                <span className="flex items-center align-middle text-center leading-[1rem] ">
                                                                    {
                                                                        savedPost
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
                                                        {savedPost.comments
                                                            .length +
                                                            repliesCount}
                                                    </span>
                                                </div>
                                            </div>
                                            <div
                                                onClick={() => {
                                                    navigate(
                                                        `/forum-post/${savedPost._id}`
                                                    );
                                                }}
                                                className="w-full mx-[0.25rem] text-transparent"
                                            >
                                                .
                                            </div>
                                            <button
                                                disabled={
                                                    removingSavedPost
                                                        ? true
                                                        : false
                                                }
                                                onClick={() => {
                                                    removeSavedPost(
                                                        userData.username,
                                                        savedPost._id
                                                    );
                                                }}
                                                className="py-1 px-3 rounded-full flex gap-3 items-center align-middle text-center text-md text-text bg-cardButtonBg hover:text-offText"
                                            >
                                                <span className="flex items-center justify-center text-sm text-accent">
                                                    <FontAwesomeIcon
                                                        icon={faBookmarkSolid}
                                                    />
                                                </span>
                                                <span className="text-md text-center items-center">
                                                    Remove
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        } else if (activeTab === "saved" && savedPosts.length <= 0) {
            return (
                <div className="mt-10 flex flex-col gap-2">
                    <FontAwesomeIcon className="text-2xl" icon={faBookmark} />
                    <div className="flex justify-center text-offText animate-slideDown">{`You have not saved any posts yet.`}</div>
                </div>
            );
        }
    };

    // handles display users' followers in 2 cases
    // 1. if the active tab is 'followers' and the users' followers > 0, return user followers
    // 2. if the active tab  is 'followers', but the user has no followers, return appropriate message
    const displayFollowers = () => {
        if (activeTab === "followers" && userData.followers.length > 0) {
            return (
                <div className="mt-[1rem] flex flex-col gap-2">
                    {userData.followers.map((user) => (
                        <div key={user._id}>
                            <div className="flex gap-4 items-center rounded-xl">
                                <div className="flex justify-between w-full items-center">
                                    <Link
                                        to={`/user/${user.username}`}
                                        className="flex items-center gap-4"
                                    >
                                        <div
                                            className={`text-2xl w-10 h-10 border border-border rounded-full flex justify-center items-center ${profileColor(
                                                user
                                            )}`}
                                        >
                                            {profileIcon(user)}
                                        </div>
                                        <div>{user.username}</div>
                                    </Link>
                                </div>
                            </div>
                            <hr className="border-1 border-border p-0 mt-2"></hr>
                        </div>
                    ))}
                </div>
            );
        } else if (activeTab === "followers") {
            return (
                <div className="mt-10 flex flex-col gap-2">
                    <FontAwesomeIcon
                        className="text-2xl"
                        icon={faUserRegular}
                    />
                    <div className="flex justify-center text-offText animate-slideDown">{`You have no followers yet.`}</div>
                </div>
            );
        }
    };

    // handles display users' following in 2 cases
    // 1. if the active tab is 'following' and the users' following > 0, return user following
    // 2. if the active tab  is 'following', but the user has no following, return appropriate message
    const displayFollowing = () => {
        if (activeTab === "following") {
            if (userData.following.length > 0) {
                return (
                    <div className="mt-[1rem] flex flex-col gap-2">
                        {userData.following.map((user) => (
                            <div key={user._id}>
                                <div className="flex gap-4 items-center rounded-xl">
                                    <div className="flex justify-between w-full items-center">
                                        <Link
                                            to={`/user/${user.username}`}
                                            className="flex items-center gap-4"
                                        >
                                            <div
                                                className={`text-2xl w-10 h-10 border border-border rounded-full flex justify-center items-center ${profileColor(
                                                    user
                                                )}`}
                                            >
                                                {profileIcon(user)}
                                            </div>
                                            <div>{user.username}</div>
                                        </Link>
                                    </div>
                                </div>
                                <hr className="border-1 border-border p-0 mt-2"></hr>
                            </div>
                        ))}
                    </div>
                );
            } else {
                return (
                    <div className="mt-10 flex flex-col gap-2">
                        <FontAwesomeIcon
                            className="text-2xl"
                            icon={faUserRegular}
                        />
                        <div className="flex justify-center text-offText animate-slideDown">{`You’re not following anyone yet.`}</div>
                    </div>
                );
            }
        }
    };

    // PATCH request to remove a users' saved post via endpoint
    // creates a global notification on success/fail
    const removeSavedPost = (username, postId) => {
        setRemovingSavedPost(true);
        setPostToRemove(postId);
        axios
            .patch(
                `${baseURL}/users/remove-saved-post/${postId}`,
                { username: username },
                {
                    withCredentials: true,
                }
            )
            .then((res) => {
                addMessage("Removed saved post successfully.");
                getSavedPosts(username);
            })
            .catch((err) => {
                setRemovingSavedPost(false);
                addMessage("Could not remove saved post.");
                console.log(err);
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
        // remove the message by its id
        setGlobalNotificationMessages((prevMessages) =>
            prevMessages.filter((message) => message.id !== id)
        );
    };

    // DELETE user profile, their posts, and profile from following/followers lists
    const deleteProfile = () => {
        axios
            .delete(`${baseURL}/users/delete-user/${userData.username}`, {
                withCredentials: true,
            })
            .then(() => {
                window.location.reload();
                addMessage("Deleted profile successfully.");
            })
            .catch((err) => {
                console.log("Failed to delete profile: ", err);
                addMessage("Failed to delete profile.");
            });
    };

    // if forum posts have not been retrieved, display loading animation
    if (!userData || setIsAuthenticated === false || !userPosts || !savedPosts)
        return (
            <div className="w-full lg:max-w-[800px] lg:mx-auto sm:w-[calc(100%-60px)] sm:ml-[60px] text-wrap flex justify-center mt-10 animate-fadeInBounce">
                <FontAwesomeIcon
                    icon={faCompass}
                    className="animate-windUpSpin text-[2.5rem] text-text"
                />
            </div>
        );

    // if all data has been successfully retrieved, display user profile
    return (
        <div className="w-full lg:max-w-[800px] lg:mx-auto sm:w-[calc(100%-60px)] sm:ml-[60px] px-2 text-wrap animate-slideDown">
            <div className="">
                <div
                    className={` ${
                        showProfileCustomization ? "visible" : "hidden"
                    }`}
                >
                    <CustomizeProfile
                        showProfileCustomization={showProfileCustomization}
                        setShowProfileCustomization={
                            setShowProfileCustomization
                        }
                        userData={userData}
                        baseURL={baseURL}
                    />
                </div>

                {showDeleteProfile === true ? (
                    <div className="fixed top-0 left-0 w-full h-full animate-slideDown z-[999]">
                        <div
                            className="fixed top-0 left-0 w-full h-full"
                            onClick={() => {
                                setShowDeleteProfile(!showDeleteProfile);
                            }}
                        ></div>
                        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 w-[90%] sm:w-fit -translate-y-1/2 rounded-xl shadow-[0_35px_60px_1500px_rgba(0,0,0,0.5)]">
                            <div className="bg-cardBg p-5 rounded-xl">
                                <div className="flex flex-col gap-1">
                                    <div className="flex justify-between items-center align-middle">
                                        <div className="text-xl font-bold">
                                            Delete Profile?
                                        </div>
                                        <button
                                            onClick={() => {
                                                setShowDeleteProfile(
                                                    !showDeleteProfile
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
                                        Are you sure you want to delete your
                                        profile? You can't undo this.
                                    </div>
                                    <div className="text-sm text-placeholderText mt-2">
                                        Username: {userData.username}
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end mt-5">
                                    <button
                                        onClick={() => {
                                            setShowDeleteProfile(
                                                !showDeleteProfile
                                            );
                                        }}
                                        className="rounded-full px-3 py-2 bg-border text-text font-semibold w-[6rem] hover:brightness-75"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            deleteProfile();
                                            setShowDeleteProfile(
                                                !showDeleteProfile
                                            );
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
                <div className="font-[500] text-3xl mb-[1rem] mt-4 flex gap-2 items-center justify-between">
                    <div className="flex gap-4 items-center">
                        <div
                            className={`text-2xl w-14 h-14 border border-border rounded-full flex justify-center items-center ${profileColor(
                                userData
                            )}`}
                        >
                            {profileIcon(userData)}
                        </div>
                        <div className="sm:text-3xl text-xl">
                            {userData.username}
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={copyProfileLink}
                            className="flex justify-center items-center hover:underline decoration-2 decoration-accent underline-offset-2 border border-border sm:border-none rounded-full"
                        >
                            <div className="text-sm rounded-full h-8 w-8 flex justify-center items-center text-text">
                                <div className="flex justify-center items-center">
                                    {profileLinkCopied ? (
                                        <FontAwesomeIcon
                                            icon={faCheck}
                                            className="sm:w-4 sm:h-4 h-5 w-5"
                                        />
                                    ) : (
                                        <FontAwesomeIcon
                                            icon={faLink}
                                            className="sm:w-4 sm:h-4 h-5 w-5"
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="text-sm font-normal text-offText mr-1 sm:flex hidden">
                                {profileLinkCopied
                                    ? "Copied URL"
                                    : "Copy Profile URL"}
                            </div>
                        </button>
                        <button
                            onClick={() => {
                                setShowProfileCustomization(
                                    !showProfileCustomization
                                );
                            }}
                            className={`flex justify-center items-center sm:py-2 sm:px-3 rounded-full p-2 border border-border hover:bg-border ${
                                showProfileCustomization ? "bg-border" : ""
                            }`}
                        >
                            <FontAwesomeIcon
                                icon={faPencil}
                                className="sm:w-3 sm:h-3 h-4 w-4"
                            />
                            <span className="text-sm font-bold text-offText ml-2 hidden sm:flex">
                                Edit
                            </span>
                        </button>
                        <button
                            onClick={() => {
                                setShowDeleteProfile(true);
                            }}
                            className={`flex justify-center items-center sm:py-2 sm:px-3 rounded-full p-2 border border-accent hover:bg-border ${
                                showProfileCustomization ? "bg-border" : ""
                            }`}
                        >
                            <FontAwesomeIcon
                                icon={faTrashCan}
                                className="sm:w-3 sm:h-3 h-4 w-4 text-accent"
                            />
                            <span className="text-sm font-bold text-accent ml-2 hidden sm:flex">
                                Delete Profile
                            </span>
                        </button>
                    </div>
                </div>
                <div className="flex w-full justify-stretch gap-2">
                    <div className="w-full flex flex-col justify-center items-left text-left bg-cardBg rounded-xl p-3 gap-1">
                        <div className="font-light">
                            {moment(userData.created_at).format("MM/D/YY")}
                        </div>
                        <div className="font-[500] text-offText">Created</div>
                    </div>
                    <div className="w-full flex flex-col justify-center items-left text-left bg-cardBg rounded-xl p-3 gap-1">
                        <div className="font-light">
                            {userPostsStats.numOfPosts}
                        </div>
                        <div className="font-[500] text-offText">Posts</div>
                    </div>
                    <div className="w-full flex flex-col justify-center items-left text-left bg-cardBg rounded-xl p-3 gap-1">
                        <div className="font-light">
                            {userPostsStats.numOfLikes}
                        </div>
                        <div className="font-[500] text-offText">Likes</div>
                    </div>
                    <div className="w-full flex flex-col justify-center items-left text-left bg-cardBg rounded-xl p-3 gap-1">
                        <div className="font-light">
                            {userPostsStats.numOfDislikes}
                        </div>
                        <div className="font-[500] text-offText">Dislikes</div>
                    </div>
                </div>
            </div>
            <div className="mt-[2rem] mx-1">
                <div>
                    <div className="flex gap-1 border-b-[1px] pb-4 border-border">
                        <button
                            onClick={() => {
                                setActiveTab("posts");
                            }}
                            className={`sm:text-md text-sm text-text font-semibold rounded-full sm:py-2 sm:px-3 py-1 px-2 w-full ${
                                activeTab === "posts"
                                    ? "bg-primary border-transparent"
                                    : "hover:underline decoration-[3px] decoration-primary underline-offset-[4px]"
                            }`}
                        >
                            Posts
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab("saved");
                            }}
                            className={`sm:text-md text-sm text-text font-semibold rounded-full sm:py-2 sm:px-3 py-1 px-2 w-full ${
                                activeTab === "saved"
                                    ? "bg-primary border-transparent"
                                    : "hover:underline decoration-[3px] decoration-primary underline-offset-[4px]"
                            }`}
                        >
                            Saved
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab("followers");
                            }}
                            className={`sm:text-md text-sm text-text font-semibold rounded-full sm:py-2 sm:px-3 py-1 px-2 w-full ${
                                activeTab === "followers"
                                    ? "bg-primary border-transparent"
                                    : "hover:underline decoration-[3px] decoration-primary underline-offset-[4px]"
                            }`}
                        >
                            {`Followers (${userData.followers.length})`}
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab("following");
                            }}
                            className={`sm:text-md text-sm text-text font-semibold rounded-full sm:py-2 sm:px-3 py-1 px-2 w-full ${
                                activeTab === "following"
                                    ? "bg-primary border-transparent"
                                    : "hover:underline decoration-[3px] decoration-primary underline-offset-[4px]"
                            }`}
                        >
                            {`Following (${userData.following.length})`}
                        </button>
                    </div>

                    {displayPosts()}

                    {displaySavedPosts()}

                    {displayFollowers()}

                    {displayFollowing()}
                </div>
            </div>
        </div>
    );
};

export default Profile;
