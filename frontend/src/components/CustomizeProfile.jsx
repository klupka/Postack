import React, { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faDove,
    faHorse,
    faKiwiBird,
    faUser,
    faXmark,
    faPaw,
} from "@fortawesome/free-solid-svg-icons";

// Component: CustomizeProfile
// window used to edit user profile
const CustomizeProfile = ({
    showProfileCustomization,
    setShowProfileCustomization,
    userData,
    baseURL,
}) => {
    // useState variable to store current user customization
    const [currentProfileCustomization, setCurrentProfileCustomization] =
        useState({
            icon: userData.profileCustomization[0].icon,
            color: userData.profileCustomization[0].color,
        });

    // set new user customization: profile icon
    const setProfileIcon = (icon) => {
        setCurrentProfileCustomization((prevCustomization) => ({
            ...prevCustomization,
            icon: icon,
        }));
    };

    // set new user customization: profile color
    const setProfileColor = (color) => {
        setCurrentProfileCustomization((prevCustomization) => ({
            ...prevCustomization,
            color: color,
        }));
    };

    // returns a FontAwesomeIcon based on string value of currentProfileCustomization.icon
    const getCurrentProfileIcon = () => {
        const icon = currentProfileCustomization.icon;
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
                    <FontAwesomeIcon icon={faPaw} className="w-[60%] h-[60%]" />
                );
            default:
                return (
                    <FontAwesomeIcon
                        icon={faUser}
                        className="w-[60%] h-[60%]"
                    />
                );
        }
    };

    // returns a Tailwind color based on string value of currentProfileCustomization.color
    const getCurrentProfileColor = () => {
        const color = currentProfileCustomization.color;
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
    };

    // update user profile (User document) using backend endpoint
    // if successful, closes this component & reloads page
    const updateProfile = () => {
        axios
            .patch(
                `${baseURL}/users/update-profile/${userData._id}`,
                {
                    icon: currentProfileCustomization.icon,
                    color: currentProfileCustomization.color,
                },
                { withCredentials: true }
            )
            .then((res) => {
                console.log("Updated user profile");
                setShowProfileCustomization(!showProfileCustomization);
                window.location.reload();
            })
            .catch((err) => {
                console.log("User profile updated unsuccessfully:", err);
            });
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full animate-slideDown z-[999]">
            {/* clicks outside will close the window, blocking interaction with the background */}
            {/* resets profile customization (icon & color) back to users initial value */}
            <div
                className="fixed top-0 left-0 w-full h-full"
                onClick={() => {
                    setShowProfileCustomization(!showProfileCustomization);
                    setCurrentProfileCustomization({
                        icon: userData.profileCustomization[0].icon,
                        color: userData.profileCustomization[0].color,
                    });
                }}
            ></div>
            <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-xl shadow-[0_35px_60px_1500px_rgba(0,0,0,0.5)]">
                <div className="bg-cardBg p-5 rounded-xl flex flex-col gap-5">
                    <div className="flex justify-between items-center align-middle">
                        <div className="text-xl font-bold">Edit Profile</div>
                        {/* close button (x), closes window on click */}
                        <button
                            onClick={() => {
                                setShowProfileCustomization(
                                    !showProfileCustomization
                                );
                                setCurrentProfileCustomization({
                                    icon: userData.profileCustomization[0].icon,
                                    color: userData.profileCustomization[0]
                                        .color,
                                });
                            }}
                            className="flex justify-center align-middle items-center bg-border rounded-full p-2 hover:brightness-75"
                        >
                            <FontAwesomeIcon
                                icon={faXmark}
                                className="w-5 h-5"
                            />
                        </button>
                    </div>
                    <div className="flex flex-col gap-5">
                        {/* preview of new profile customization */}
                        <div className="text-text flex flex-col gap-2">
                            <div className="text-text font-semibold">
                                Preview
                            </div>
                            <div className="flex justify-center">
                                <div
                                    className={`text-2xl w-20 h-20 border-2 border-border rounded-full flex justify-center items-center ${getCurrentProfileColor()}`}
                                >
                                    {getCurrentProfileIcon()}
                                </div>
                            </div>
                        </div>
                        {/* selected icon and icon options */}
                        <div className="text-text flex flex-col gap-2">
                            <div className="text-text font-semibold">
                                Select an Icon
                            </div>
                            <div className="flex gap-2 p-2 border border-border rounded-xl">
                                <button
                                    onClick={() => {
                                        setProfileIcon("user");
                                    }}
                                    className={`text-2xl w-14 h-14 border-2 border-border rounded-full flex justify-center items-center bg-border hover:brightness-75 ${
                                        currentProfileCustomization.icon ===
                                        "user"
                                            ? "border-primary"
                                            : ""
                                    } `}
                                >
                                    <FontAwesomeIcon icon={faUser} />
                                </button>
                                <button
                                    onClick={() => {
                                        setProfileIcon("dove");
                                    }}
                                    className={`text-2xl w-14 h-14 border-2 border-border rounded-full flex justify-center items-center bg-border hover:brightness-75 ${
                                        currentProfileCustomization.icon ===
                                        "dove"
                                            ? "border-primary"
                                            : ""
                                    }`}
                                >
                                    <FontAwesomeIcon icon={faDove} />
                                </button>
                                <button
                                    onClick={() => {
                                        setProfileIcon("kiwiBird");
                                    }}
                                    className={`text-2xl w-14 h-14 border-2 border-border rounded-full flex justify-center items-center bg-border hover:brightness-75 ${
                                        currentProfileCustomization.icon ===
                                        "kiwiBird"
                                            ? "border-primary"
                                            : ""
                                    }`}
                                >
                                    <FontAwesomeIcon icon={faKiwiBird} />
                                </button>
                                <button
                                    onClick={() => {
                                        setProfileIcon("horse");
                                    }}
                                    className={`text-2xl w-14 h-14 border-2 border-border rounded-full flex justify-center items-center bg-border hover:brightness-75 ${
                                        currentProfileCustomization.icon ===
                                        "horse"
                                            ? "border-primary"
                                            : ""
                                    }`}
                                >
                                    <FontAwesomeIcon icon={faHorse} />
                                </button>
                                <button
                                    onClick={() => {
                                        setProfileIcon("paw");
                                    }}
                                    className={`text-2xl w-14 h-14 border-2 border-border rounded-full flex justify-center items-center bg-border hover:brightness-75 ${
                                        currentProfileCustomization.icon ===
                                        "paw"
                                            ? "border-primary"
                                            : ""
                                    }`}
                                >
                                    <FontAwesomeIcon icon={faPaw} />
                                </button>
                            </div>
                        </div>
                        {/* selected color and color options */}
                        <div className="text-text flex flex-col gap-2">
                            <div className="text-text font-semibold">
                                Select a Color
                            </div>
                            <div className="flex justify-around gap-2 p-2 border border-border rounded-xl">
                                <button
                                    onClick={() => {
                                        setProfileColor("red");
                                    }}
                                    className={`text-2xl w-8 h-8 border-2 border-border rounded-full flex justify-center items-center bg-red-500 hover:brightness-75 ${
                                        currentProfileCustomization.color ===
                                        "red"
                                            ? "border-primary"
                                            : ""
                                    }`}
                                ></button>
                                <button
                                    onClick={() => {
                                        setProfileColor("orange");
                                    }}
                                    className={`text-2xl w-8 h-8 border-2 border-border rounded-full flex justify-center items-center bg-orange-500 hover:brightness-75 ${
                                        currentProfileCustomization.color ===
                                        "orange"
                                            ? "border-primary"
                                            : ""
                                    }`}
                                ></button>
                                <button
                                    onClick={() => {
                                        setProfileColor("yellow");
                                    }}
                                    className={`text-2xl w-8 h-8 border-2 border-border rounded-full flex justify-center items-center bg-yellow-500 hover:brightness-75 ${
                                        currentProfileCustomization.color ===
                                        "yellow"
                                            ? "border-primary"
                                            : ""
                                    }`}
                                ></button>
                                <button
                                    onClick={() => {
                                        setProfileColor("green");
                                    }}
                                    className={`text-2xl w-8 h-8 border-2 border-border rounded-full flex justify-center items-center bg-green-500 hover:brightness-75 ${
                                        currentProfileCustomization.color ===
                                        "green"
                                            ? "border-primary"
                                            : ""
                                    }`}
                                ></button>
                                <button
                                    onClick={() => {
                                        setProfileColor("blue");
                                    }}
                                    className={`text-2xl w-8 h-8 border-2 border-border rounded-full flex justify-center items-center bg-blue-500 hover:brightness-75 ${
                                        currentProfileCustomization.color ===
                                        "blue"
                                            ? "border-primary"
                                            : ""
                                    }`}
                                ></button>
                                <button
                                    onClick={() => {
                                        setProfileColor("violet");
                                    }}
                                    className={`text-2xl w-8 h-8 border-2 border-border rounded-full flex justify-center items-center bg-violet-500 hover:brightness-75 ${
                                        currentProfileCustomization.color ===
                                        "violet"
                                            ? "border-primary"
                                            : ""
                                    }`}
                                ></button>
                            </div>
                        </div>
                        {/* save button, confirms new profile customization and executes updateProfile() */}
                        <div className="flex gap-5 justify-end">
                            <button
                                onClick={updateProfile}
                                className="mt-5 bg-primary p-2 rounded-full flex justify-center items-center text-white font-semibold w-full hover:brightness-110"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomizeProfile;
