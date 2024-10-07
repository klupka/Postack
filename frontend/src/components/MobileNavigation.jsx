import { faComments, faStar } from "@fortawesome/free-solid-svg-icons";
import {
    faStar as faStarRegular,
    faComments as faCommentsRegular,
} from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Link } from "react-router-dom";

// Component: MobileNavigation
// replaces the left side navigation with a reachable bottom navigation for home & following
const MobileNavigation = ({ currentLocationURL }) => {
    return (
        <div className="left-0 top-[calc(100%-75px)] bg-background border-t border-border w-screen fixed overflow-hidden z-50">
            <div className="flex gap-0 justify-center items-center h-[75px]">
                <Link
                    to="/"
                    className={`w-full h-full ${
                        currentLocationURL === "/"
                            ? "opacity-100"
                            : "opacity-60"
                    }`}
                >
                    <div
                        className={`flex h-full flex-col pb-3 items-center justify-between p-2`}
                    >
                        <div
                            className={`px-4 py-1 rounded-full flex justify-center items-center ${
                                currentLocationURL === "/" ? "bg-primary" : ""
                            }`}
                        >
                            <FontAwesomeIcon
                                icon={
                                    currentLocationURL === "/"
                                        ? faComments
                                        : faCommentsRegular
                                }
                                className="w-6 h-6"
                            />
                        </div>
                        <div className={`text-base font-bold`}>Home</div>
                    </div>
                </Link>
                <Link
                    to="/following"
                    className={`w-full h-full ${
                        currentLocationURL === "/following"
                            ? "opacity-100"
                            : "opacity-60"
                    }`}
                >
                    <div
                        className={`flex h-full flex-col pb-3 items-center justify-between p-2`}
                    >
                        <div
                            className={`px-4 py-1 rounded-full flex justify-center items-center ${
                                currentLocationURL === "/following"
                                    ? "bg-accent"
                                    : ""
                            }`}
                        >
                            <FontAwesomeIcon
                                icon={
                                    currentLocationURL === "/following"
                                        ? faStar
                                        : faStarRegular
                                }
                                className="h-6 w-6"
                            />
                        </div>
                        <div className={`text-base font-bold`}>Following</div>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default MobileNavigation;
