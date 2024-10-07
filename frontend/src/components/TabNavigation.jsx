import { Link } from "react-router-dom";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faStar } from "@fortawesome/free-solid-svg-icons";
import {
    faStar as faStarRegular,
    faComments as faCommentsRegular,
} from "@fortawesome/free-regular-svg-icons";

// Component: TabNavigation
// side navigation bar for home & following pages
// is replaced with MobileNavigation.jsx at mobile screen sizes
const TabNavigation = ({ currentLocationURL }) => {
    return (
        <div className="sm:block hidden fixed bg-background">
            <div className="flex flex-col justify-start group px-2 pt-2 border-r gap-2 border-border h-screen">
                <Link
                    to="/"
                    onClick={() => {
                        window.scrollTo({
                            top: 0,
                            left: 0,
                            behavior: "smooth",
                        });
                    }}
                    className="w-full transition-transform transform hover:-translate-y-[.15rem] duration-300"
                >
                    <div
                        className={`rounded-full flex gap-4 items-center p-3 ${
                            currentLocationURL === "/"
                                ? "font-normal text-text bg-primary hover:bg-primary"
                                : "font-normal text-placeholderText hover:bg-border"
                        }`}
                    >
                        <FontAwesomeIcon
                            icon={
                                currentLocationURL === "/"
                                    ? faComments
                                    : faCommentsRegular
                            }
                            className="h-6 w-6"
                        />
                    </div>
                </Link>
                <Link
                    to="/following"
                    onClick={() => {
                        window.scrollTo({
                            top: 0,
                            left: 0,
                            behavior: "smooth",
                        });
                    }}
                    className="w-full transition-transform transform hover:-translate-y-[.15rem] duration-300"
                >
                    <div
                        className={`rounded-full flex gap-4 items-center p-3 ${
                            currentLocationURL === "/following"
                                ? "font-normal text-text bg-accent hover:bg-accent"
                                : "font-normal text-placeholderText hover:bg-border"
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
                </Link>
            </div>
        </div>
    );
};

export default TabNavigation;
