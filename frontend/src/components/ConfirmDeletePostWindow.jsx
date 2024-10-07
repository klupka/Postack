import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React from "react";

// Component: ConfirmDeletePostWindow
// used for forum post deletion confirmation
// used in Forum.jsx & Following.jsx
const ConfirmDeletePostWindow = ({
    postId,
    getForumPosts,
    currentSortOption,
    setGlobalNotificationMessages,
    globalNotificationMessages,
    setDeletingUserPost,
    setPostToDelete,
    baseURL,
    userData,
    showDeletePostWindow,
    setShowDeletePostWindow,
}) => {
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
        setGlobalNotificationMessages((prevMessages) =>
            prevMessages.filter((message) => message.id !== id)
        );
    };

    // delete forum post document using backend endpoint
    // refreshes forum posts after deletion and creates a global notification
    const deleteForumPostById = (postId) => {
        setDeletingUserPost(true);
        setPostToDelete(postId);
        console.log("deleting", postId);
        axios
            .delete(`${baseURL}/forum-posts/delete/${postId}`, {
                data: { username: userData.username },
                withCredentials: true,
            })
            .then((res) => {
                console.log(`${userData.username} deleted a post.`);
                getForumPosts(currentSortOption);
                addMessage("Successfully deleted post.");
            })
            .catch((err) => {
                console.log("Error deleting post", err);
                setDeletingUserPost(false);
                addMessage("Could not delete post.");
            });
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full animate-slideDown z-[999]">
            {/* clicks outside will close the window, blocking interaction with the background */}
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
                            {/* close button (x), closes window on click */}
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
                            Are you sure you want to delete your post? You can't
                            undo this.
                        </div>
                        <div className="text-sm text-placeholderText mt-2">
                            ID: {postId}
                        </div>
                    </div>
                    <div className="flex gap-3 justify-end mt-5">
                        {/* cancel button, closes window on click */}
                        <button
                            onClick={() => {
                                setShowDeletePostWindow(!showDeletePostWindow);
                            }}
                            className="rounded-full px-3 py-2 bg-border text-text font-semibold w-[6rem] hover:brightness-75"
                        >
                            Cancel
                        </button>
                        {/* delete button, confirmation to continue with deletion, executes deleteForumPostById() */}
                        <button
                            onClick={() => {
                                setShowDeletePostWindow(!showDeletePostWindow);
                                deleteForumPostById(postId);
                            }}
                            className="rounded-full px-3 py-2 bg-accent text-text font-semibold w-[6rem] hover:brightness-75"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeletePostWindow;
