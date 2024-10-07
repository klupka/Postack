import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
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
} from "@fortawesome/free-regular-svg-icons";
import {
    faCompass,
    faUser,
    faLink,
    faThumbsDown as faThumbsDownSolid,
    faThumbsUp as faThumbsUpSolid,
    faBookmark as faBookmarkSolid,
    faCheck,
    faDove,
    faKiwiBird,
    faHorse,
    faPaw,
    faUserPlus,
    faUserMinus,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

// Page: User
// users, authenticated or not, can view other users posts, saved posts, and view their followers/following
const User = ({ setAuthUserData, authUserData }) => {
    // username passed through URL params
    const { username } = useParams();
    // frontend URL
    const URLFrontEndBase = "http://localhost:5173";
    // backend URL
    const baseURL = "http://localhost:8000";
    // check authentication endpoint URL
    const checkAuthURL = `${baseURL}/users/protected-route`;
    // useState hook to store user data
    const [userData, setUserData] = useState([]);
    // useState hook to verify if authentication has been checked
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    // useState hook to verify the user that is being requested exists
    const [userExists, setUserExists] = useState(null);
    // useState hook to store user post data
    const [userPosts, setUserPosts] = useState(null);
    // useState hook to store user post statistics
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
    // useState hook to disable follow/unfollow button while request is processing
    const [processingFollowRequest, setProcessingFollowRequest] =
        useState(false);

    // GET user post data via endpoint
    const getUserPosts = () => {
        axios
            .get(`${baseURL}/users/user-posts/${username}`)
            .then((res) => {
                setUserPosts(res.data);
                getTotalPosts(res.data);
            })
            .catch((err) => {
                setUserPosts(null);
                console.log("Unable to retrieved user posts");
            });
    };

    // GET users saved post data via endpoint
    const getSavedPosts = (username) => {
        axios
            .get(`${baseURL}/forum-posts/saved-posts/${username}`)
            .then((res) => {
                setSavedPosts(res.data);
            })
            .catch((err) => {
                console.log("Failed to fetch saved posts", err);
            });
    };

    // GET user data via endpoint
    const getUser = () => {
        axios
            .get(`${baseURL}/users/user/${username}`)
            .then((res) => {
                if (res.data.length > 0) {
                    setUserData(res.data[0]);
                    setUserExists(true);
                    getSavedPosts(res.data[0].username);
                } else if (res.data.length === 0) {
                    setUserExists(false);
                }
            })
            .catch((err) => {
                console.log("User data retrieved unsuccessfully:", err);
                setUserExists(false);
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

    // check user authentication via endpoint
    const checkAuth = () => {
        axios
            .get(checkAuthURL, { withCredentials: true })
            .then((res) => {
                if (res.data.user.username === username) {
                    navigate("/profile");
                }
                setIsAuthChecked(true);
                setAuthUserData(res.data.user);
                setProcessingFollowRequest(false);
            })
            .catch((err) => {
                console.log("User not authenticated");
                setProcessingFollowRequest(false);
                setIsAuthChecked(true);
                setAuthUserData([]);
            });
    };

    // if the authenticated user is not already authenticated, execute checkAuth()
    // refreshes authenticated user data if changed
    useEffect(() => {
        if (authUserData === null) {
            checkAuth();
        }
    }, [authUserData]);

    // on load: getUser(), checkAuth(), getUserPosts()
    useEffect(() => {
        getUser();
        checkAuth();
        getUserPosts();
    }, [username]);

    // copy link to user profile, temporarily shows 'copied' instead of 'copy'
    const copyProfileLink = () => {
        navigator.clipboard.writeText(
            `${URLFrontEndBase}/user/${userData.username}`
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

    // PATCH request to follow/unfollow a user, refreshes authenticated user data and user data
    const followUser = () => {
        const followUserURL = `${baseURL}/users/follow/${userData.username}`;
        const unfollowUserURL = `${baseURL}/users/unfollow/${userData.username}`;
        setProcessingFollowRequest(true);
        axios
            .patch(
                followUserURL,
                { followRequester: authUserData.username },
                { withCredentials: true }
            )
            .then(() => {
                checkAuth();
                getUser();
            })
            .catch((err) => {
                if (err.status === 403) {
                    console.log("Unfollowing..");
                    axios
                        .patch(
                            unfollowUserURL,
                            { unfollowRequester: authUserData.username },
                            { withCredentials: true }
                        )
                        .then(() => {
                            checkAuth();
                            getUser();
                        })
                        .catch((err) => {
                            if (err.status === 403) {
                                console.log(
                                    "Cannot unfollow someone you're not following"
                                );
                            } else {
                                setProcessingFollowRequest(false);
                                console.log("Something went wrong", err);
                            }
                        });
                } else {
                    console.log("Something went wrong", err);
                    setProcessingFollowRequest(false);
                }
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
                                                                authUserData.username
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
                                                                authUserData.username
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
                    <div className="flex justify-center text-offText animate-slideDown">{`This user has not posted yet.`}</div>
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
                            <div key={index}>
                                <div>
                                    <div
                                        className={`rounded-xl p-3 flex flex-col gap-4 bg-cardBg hover:bg-cardBgHover hover:cursor-pointer`}
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
                                                    to={`/user/${savedPost.author}`}
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
                                                                authUserData.username
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
                                                                authUserData.username
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
                    <div className="flex justify-center text-offText animate-slideDown">{`This user has not saved any posts yet.`}</div>
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
                    <div className="flex justify-center text-offText animate-slideDown">{`This user has no followers yet.`}</div>
                </div>
            );
        }
    };

    // handles display users' following in 2 cases
    // 1. if the active tab is 'following' and the users' following > 0, return user following
    // 2. if the active tab  is 'following', but the user has no following, return appropriate message
    const displayFollowing = () => {
        if (activeTab === "following" && userData.following.length > 0) {
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
        } else if (activeTab === "following") {
            return (
                <div className="mt-10 flex flex-col gap-2">
                    <FontAwesomeIcon
                        className="text-2xl"
                        icon={faUserRegular}
                    />
                    <div className="flex justify-center text-offText animate-slideDown">{`This user is not following anyone yet.`}</div>
                </div>
            );
        }
    };

    // if the user of the profile you are trying to view does not exist, return appropriate message
    if (userExists === false) {
        return (
            <div className="w-full lg:max-w-[800px] lg:mx-auto sm:w-[calc(100%-60px)] sm:ml-[60px] text-wrap flex justify-center mt-20 animate-slideDown">
                <div className="flex justify-center flex-col gap-2 px-2">
                    <div className="text-[2rem] font-bold text-text text-center">
                        That user doesn't exist!
                    </div>
                    <div className="text-center text-sm text-placeholder">
                        The user you are looking for may have been removed.
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

    // if user data has not been retrieved, display loading animation
    if (
        !userData ||
        userExists === null ||
        userPosts === null ||
        isAuthChecked === false
    )
        return (
            <div className="w-full lg:max-w-[800px] lg:mx-auto sm:w-[calc(100%-60px)] sm:ml-[60px] text-wrap flex justify-center mt-10 animate-fadeInBounce">
                <FontAwesomeIcon
                    icon={faCompass}
                    className="animate-windUpSpin text-[2.5rem] text-text"
                />
            </div>
        );
    // if all data has been successfully retrieved, display user
    if (isAuthChecked) {
        return (
            <div className="w-full lg:max-w-[800px] lg:mx-auto sm:w-[calc(100%-60px)] sm:ml-[60px] px-2 text-wrap animate-slideDown">
                <div className="">
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
                        <div className="flex gap-2">
                            <button
                                onClick={copyProfileLink}
                                className="flex justify-center items-center hover:underline decoration-2 decoration-accent underline-offset-2 border border-border sm:border-none rounded-full"
                            >
                                <div className="text-sm rounded-full flex justify-center items-center text-text p-2">
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
                            {authUserData.username != null ? (
                                <button
                                    disabled={
                                        processingFollowRequest ? true : false
                                    }
                                    onClick={() => {
                                        if (
                                            authUserData.length === 0 &&
                                            isAuthChecked
                                        ) {
                                            navigate("/register");
                                        } else {
                                            console.log("Following user...");
                                            followUser();
                                        }
                                    }}
                                    className={`flex justify-center items-center py-2 px-3 gap-2 rounded-full border hover:bg-border ${
                                        authUserData.following.some(
                                            (user) =>
                                                user.username ===
                                                userData.username
                                        )
                                            ? "text-accent border-accent"
                                            : "text-text border-border"
                                    }`}
                                >
                                    <div
                                        className={`text-sm rounded-full flex justify-center items-center`}
                                    >
                                        <div>
                                            {authUserData.following.some(
                                                (user) =>
                                                    user.username ===
                                                    userData.username
                                            ) ? (
                                                <FontAwesomeIcon
                                                    icon={faUserMinus}
                                                    className="w-4 h-4"
                                                />
                                            ) : (
                                                <FontAwesomeIcon
                                                    icon={faUserPlus}
                                                    className="w-4 h-4"
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold mr-1">
                                        {authUserData.following.some(
                                            (user) =>
                                                user.username ===
                                                userData.username
                                        )
                                            ? "Unfollow"
                                            : "Follow"}
                                    </div>
                                </button>
                            ) : (
                                ""
                            )}
                        </div>
                    </div>
                    <div className="flex w-full justify-stretch gap-2">
                        <div className="w-full flex flex-col justify-center items-left text-left bg-cardBg rounded-xl p-3 gap-1">
                            <div className="font-light">
                                {moment(userData.created_at).format("MM/D/YY")}
                            </div>
                            <div className="font-[500] text-offText">
                                Created
                            </div>
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
                            <div className="font-[500] text-offText">
                                Dislikes
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-[2rem] mx-1">
                    <div>
                        <div className="flex gap-5 border-b-[1px] pb-4 border-border">
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
    }
};

export default User;
