import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompass } from "@fortawesome/free-solid-svg-icons";

// Page: CreatePost
// allows authenticated users to create forum posts
const CreatePost = ({ baseURL }) => {
    // backend endpoint URLs
    const checkAuthURL = `${baseURL}/users/protected-route`;
    const createPostURL = `${baseURL}/forum-posts/create-forum-post`;
    // useState hook to verify authentication state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // useState hook to store user data
    const [userData, setUserData] = useState([]);
    // useState hook to store new post data
    const [post, setPost] = useState({
        title: "",
        content: "",
        author: "",
    });
    // character limit for new forum post title
    const maxTitleCharacterLength = 150;
    // navigation hook
    const navigate = useNavigate();

    // on load: execute checkAuth(); gets userData
    useEffect(() => {
        checkAuth();
    }, []);

    // GET userData, set isAuthenticated, set author value for new post
    const checkAuth = () => {
        axios
            .get(checkAuthURL, { withCredentials: true })
            .then((res) => {
                setUserData(res.data.user);
                setPost({
                    title: "",
                    content: "",
                    author: res.data.user.username,
                });
                setIsAuthenticated(true);
            })
            .catch(() => {
                setIsAuthenticated(false);
                setUserData([]);
            });
    };

    // set post title and content (body) data as it is entered through input forms
    const handleInput = (event) => {
        setPost({ ...post, [event.target.name]: event.target.value });
    };

    // executed on form submit; removes white space from content (body)
    // POST new forum post to database via endpoint and navigate to newly created post
    const handleSubmit = (event) => {
        const removedWhiteSpaced = {
            title: post.title,
            content: post.content.replace(/^\s+|\s+$/g, ""),
            author: post.author,
        };
        event.preventDefault();
        axios
            .post(createPostURL, removedWhiteSpaced)
            .then((res) => {
                setPost({
                    title: "",
                    content: "",
                    author: "",
                });
                navigate(`/forum-post/${res.data._id}`);
            })
            .catch((err) => console.log(err));
    };

    // if userData is empty, display loading animation
    if (userData.length <= 0) {
        return (
            <div className="mx-auto w-full max-w-[1000px] px-auto text-wrap flex justify-center mt-10 animate-fadeInBounce">
                <FontAwesomeIcon
                    icon={faCompass}
                    className="animate-windUpSpin text-[2.5rem] text-text"
                />
            </div>
        );
    }

    // if userData exists, display CreatePost forms
    return (
        <div className="w-full lg:max-w-[800px] lg:mx-auto sm:w-[calc(100%-60px)] sm:ml-[60px] px-2 text-wrap animate-slideDown">
            {/* another check to ensure user is authenticated before proceeding */}
            {isAuthenticated ? (
                <div className="flex flex-col rounded-xl mt-5 px-2">
                    <div className="text-2xl mb-5 font-semibold">New Post</div>
                    <form onSubmit={handleSubmit} className="flex flex-col">
                        <span
                            className={`relative ${
                                post.title ? "" : 'after:content-["*"]'
                            } after:absolute after:top-[1.09rem] after:left-[2.95rem] after:text-accent after:font-bold after:focus-within:text-transparent`}
                        >
                            <input
                                className="bg-transparent p-4 pt-6 pb-2 rounded-xl placeholder:text-placeholderText placeholder:fixed placeholder:top-[1rem] placeholder:font-normal focus:text-text focus:outline-none focus:ring-1 focus:ring-primary border border-border focus:border-transparent w-full peer focus:placeholder-transparent"
                                placeholder="Title"
                                type="text"
                                onChange={handleInput}
                                name="title"
                                value={post.title}
                                maxLength={maxTitleCharacterLength}
                                id="Title"
                            ></input>
                            <label
                                htmlFor="Title"
                                className={`text-placeholderText text-sm absolute top-[0.2rem] left-4 ${
                                    post.title === ""
                                        ? "animate-inputLabelReverse peer-focus:animate-inputLabel"
                                        : ""
                                }`}
                            >
                                Title
                            </label>
                        </span>
                        <div
                            className={`${
                                post.title.length === maxTitleCharacterLength
                                    ? "text-accent"
                                    : "text-offText"
                            } text-right text-sm mr-2 mt-2`}
                        >
                            {post.title.length}/{maxTitleCharacterLength}
                        </div>
                        <br />
                        <span
                            className={`relative ${
                                post.content ? "" : 'after:content-["*"]'
                            } after:absolute after:top-[1.1rem] after:left-[3.3rem] after:text-accent after:font-bold after:focus-within:text-transparent`}
                        >
                            <textarea
                                className="bg-transparent p-4 pt-6 pb-2 rounded-xl placeholder:text-placeholderText placeholder:fixed placeholder:top-[1rem] placeholder:font-normal focus:text-text focus:outline-none focus:ring-1 focus:ring-primary border border-border focus:border-transparent w-full peer focus:placeholder-transparent h-[15rem]"
                                placeholder="Body"
                                type="text"
                                onChange={handleInput}
                                name="content"
                                value={post.content}
                                id="Content"
                            ></textarea>
                            <label
                                htmlFor="Content"
                                className={`text-placeholderText text-sm absolute top-[0.2rem] left-4 ${
                                    post.content === ""
                                        ? "animate-inputLabelReverse peer-focus:animate-inputLabel"
                                        : ""
                                }`}
                            >
                                Body
                            </label>
                        </span>
                        <br />
                        <div className="flex justify-end">
                            <button
                                disabled={
                                    post.content && post.title ? false : true
                                }
                                className={`flex leading-1 items-center py-[0.5rem] px-[1.5rem] rounded-full ${
                                    post.content && post.title
                                        ? "bg-primary"
                                        : "bg-border"
                                }`}
                            >
                                Post
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                ""
            )}
        </div>
    );
};

export default CreatePost;
