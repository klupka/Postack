import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCircle,
    faPlus,
    faMagnifyingGlass,
    faKiwiBird,
    faArrowRightFromBracket,
    faUser,
    faHorse,
    faDove,
    faPaw,
    faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import {
    faCircleXmark,
    faMoon,
    faUser as faUserRegular,
} from "@fortawesome/free-regular-svg-icons";

// Component: Navbar
// navigation for site name & logo, search bar, create new post, user dropdown menu
const Navbar = ({
    isAuthenticated,
    setIsAuthenticated,
    setIsDarkMode,
    isDarkMode,
    setSearchValue,
    searchValue,
    userData,
    setUserData,
    baseURL,
}) => {
    // navigation hook
    const navigate = useNavigate();
    // useState hook to handle user dropdown menu display
    const [isDisplayed, setIsDisplayed] = useState(false);
    // useRef hooks to handle dropdown menu display, monitors clicks outside menu
    const dropdownListRef = useRef(null);
    const dropdownButtonRef = useRef(null);
    // useState hook to handle changing theme button animation/state
    const [isChangingTheme, setIsChangingTheme] = useState(false);
    // useState hook to handle changing theme value
    const [newIsDark, setIsNewDark] = useState(isDarkMode);

    // check if current user is authenticated
    // sets isAuthenticated useState hook
    const checkAuth = () => {
        axios
            .get(`${baseURL}/users/protected-route`, {
                withCredentials: true,
            })
            .then((res) => {
                setIsAuthenticated(true);
            })
            .catch((err) => {
                console.log("User not authenticated");
                setIsAuthenticated(false);
            });
    };

    // logs out currently authenticated user and navigates to home/root
    const logoutUser = () => {
        axios
            .get(`${baseURL}/users/logout`, {
                withCredentials: true,
            })
            .then((res) => {
                console.log(`Logged out user: ${userData.username}`);
                checkAuth();
                navigate("/");
                navigate(0);
            })
            .catch((err) => {
                console.log("Logout failed: ", err);
            });
    };

    // closes the user dropdown menu if a click occurs outside the menu
    const handleClickOutside = (event) => {
        if (
            !dropdownListRef.current.contains(event.target) &&
            !dropdownButtonRef.current.contains(event.target)
        ) {
            setIsDisplayed(false);
        }
    };

    // opens/closes the user dropdown menu on profile button click
    const handleShowHide = () => {
        setIsDisplayed(!isDisplayed);
    };

    // checks if user is authenticated and sets userData, isAuthenticated, isChangingTheme
    const getUser = () => {
        axios
            .get(`${baseURL}/users/protected-route`, { withCredentials: true })
            .then((res) => {
                setUserData(res.data.user);
                setIsAuthenticated(true);
                setIsChangingTheme(false);
            })
            .catch((err) => {
                console.log("User currently not authenticated", err);
                setIsAuthenticated(false);
            });
    };

    // on load: if userData is not already set, execute getUser() and set userData
    useEffect(() => {
        if (userData === null) {
            getUser();
        }
    }, [userData]);

    // listens for mousedown events and executes handleClickOutside()
    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // inverts value of changeUserThemePreference and executes changeUserThemePreference()
    const toggleTheme = (usernameFromUserData) => {
        setIsChangingTheme(true);
        isDarkMode
            ? changeUserThemePreference(usernameFromUserData, false)
            : changeUserThemePreference(usernameFromUserData, true);
    };

    // set new user customization: profile icon
    const profileIcon = () => {
        if (Object.keys(userData).length > 0) {
            const icon = userData.profileCustomization[0].icon;
            switch (icon) {
                case "user":
                    return (
                        <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
                    );
                case "dove":
                    return (
                        <FontAwesomeIcon icon={faDove} className="w-5 h-5" />
                    );
                case "kiwiBird":
                    return (
                        <FontAwesomeIcon
                            icon={faKiwiBird}
                            className="w-5 h-5"
                        />
                    );
                case "horse":
                    return (
                        <FontAwesomeIcon icon={faHorse} className="w-5 h-5" />
                    );
                case "paw":
                    return <FontAwesomeIcon icon={faPaw} className="w-5 h-5" />;
                default:
                    return (
                        <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
                    );
            }
        }
    };

    // set new user customization: profile color
    const profileColor = () => {
        if (Object.keys(userData).length > 0) {
            const color = userData.profileCustomization[0].color;
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

    // change user theme preference in backend via endpoint
    // if successful, refreshes userData to reflect change
    const changeUserThemePreference = (
        usernameFromUserData,
        newDarkModeValue
    ) => {
        setIsNewDark(newDarkModeValue);
        axios
            .patch(
                `${baseURL}/users/update-theme-preference/`,
                {
                    username: usernameFromUserData,
                    newDarkModeValue: newDarkModeValue,
                },
                { withCredentials: true }
            )
            .then(() => {
                setIsDarkMode(newDarkModeValue);
                getUser();
            })
            .catch((err) => {
                console.log("Could not change dark mode preference", err);
                setIsDarkMode(!newDarkModeValue);
                setIsChangingTheme(false);
            });
    };

    // handles the opacity of the dark mode button for readability & UX
    const changeOpacity = () => {
        return isChangingTheme ? "opacity-50" : "opacity-100";
    };

    // dynamically applies animations to dark mode button based on state
    const applyMovingAnimation = () => {
        if (newIsDark && isChangingTheme) return `animate-moveLeft`;
        else if (!newIsDark && isChangingTheme) return `animate-moveRight`;

        if (isDarkMode && !isChangingTheme) return `animate-stayRight`;
        else if (!isDarkMode && !isChangingTheme) return `animate-stayLeft`;
    };

    // dynamically changes dark mode button styling based on state
    const DarkModeButtonStyle = () => {
        if (isDarkMode)
            return `text-text border border-border p-1 rounded-full text-lg h-7 w-12 ml-5 flex items-center bg-primary ${changeOpacity()} `;
        else if (!isDarkMode)
            return `text-text border border-border p-1 rounded-full text-lg h-7 w-12 ml-5 flex items-center bg-background ${changeOpacity()} `;
    };

    return (
        <div className="bg-navBackground backdrop-blur-md text-text flex justify-center border-b border-border py-2 mb-4 fixed w-full z-[49] px-2">
            <div className="flex w-full">
                {/* site name & logo; scrolls to top if clicked on home/root */}
                <div className="flex items-center gap-2 mr-5 group">
                    <Link
                        className="flex items-center gap-2 w-fit"
                        to="/"
                        onClick={() => {
                            setSearchValue("");
                            window.scrollTo({
                                top: 0,
                                left: 0,
                                behavior: "smooth",
                            });
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faLayerGroup}
                            className="w-8 h-8 text-accent rotate-[270deg]"
                        />

                        <div className="hidden sm:flex sm:text-2xl text-2xl font-extrabold tracking-tighter italic">
                            POSTACK
                        </div>
                    </Link>
                </div>
                {/* search bar; filters forum posts */}
                <div className="w-full flex justify-center">
                    <div className="flex items-center gap-1 border border-border w-full md:max-w-[400px] rounded-full px-3 mx-2 bg-border focus-within:border-primary focus-within:bg-cardBgHover hover:bg-cardBgHover">
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                        <input
                            type="text"
                            placeholder="Search"
                            className="bg-transparent outline-none w-full h-full px-2 placeholder:font-light placeholder:text-placeholderText"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        ></input>
                        {searchValue === "" ? (
                            ""
                        ) : (
                            <button
                                onClick={() => {
                                    setSearchValue("");
                                }}
                            >
                                <FontAwesomeIcon icon={faCircleXmark} />
                            </button>
                        )}
                    </div>
                </div>
                {/* is authenticated: create post button & user profile button with dropdown menu */}
                {/* not authenticated: log in button -> redirects to login page*/}
                <div className="flex items-center justify-end ml-4">
                    <div className="">
                        {isAuthenticated ? (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        navigate("/create-post");
                                    }}
                                    className="flex gap-2 border justify-center items-center px-3 rounded-full border-border hover:bg-border"
                                >
                                    <FontAwesomeIcon icon={faPlus} />
                                    <div className="font-normal hidden sm:block w-20">
                                        New Post
                                    </div>
                                </button>
                                <div className="">
                                    {userData.username !== "" ? (
                                        <div className="" dir="rtl">
                                            <button
                                                ref={dropdownButtonRef}
                                                onClick={() => {
                                                    handleShowHide();
                                                }}
                                                className={`login-btn flex border border-border rounded-full border-borderColor h-10 w-10 px-4 items-center justify-center cursor-pointer text-textColor font-semibold ${profileColor()}`}
                                            >
                                                {profileIcon()}
                                            </button>
                                            <div
                                                ref={dropdownListRef}
                                                className={
                                                    isDisplayed
                                                        ? "flex flex-col border border-border rounded-xl absolute w-fit overflow-hidden bg-background text-sm animate-slideDown mt-2"
                                                        : "hidden"
                                                }
                                            >
                                                <button
                                                    onClick={() => {
                                                        navigate("/profile");
                                                        handleShowHide();
                                                    }}
                                                >
                                                    <div className="h-12 flex justify-end items-center gap-5 pl-5 hover:bg-border">
                                                        <div className="flex flex-col items-end">
                                                            <div>
                                                                View Profile
                                                            </div>
                                                            <div className="text-xs text-offText">
                                                                {
                                                                    userData.username
                                                                }
                                                            </div>
                                                        </div>
                                                        <FontAwesomeIcon
                                                            icon={faUserRegular}
                                                            className="text-lg w-5 h-5"
                                                        />
                                                    </div>
                                                </button>
                                                <div>
                                                    <div className="h-12 flex justify-end items-center gap-5 pl-5 hover:bg-border pr-4">
                                                        <button
                                                            onClick={() => {
                                                                toggleTheme(
                                                                    userData.username
                                                                );
                                                            }}
                                                            disabled={
                                                                isChangingTheme
                                                                    ? true
                                                                    : false
                                                            }
                                                            className={`${DarkModeButtonStyle()} 
                                                                ${
                                                                    isDarkMode
                                                                        ? ""
                                                                        : "bg-border"
                                                                }`}
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={faCircle}
                                                                className={`text-md ${applyMovingAnimation()}`}
                                                            />
                                                        </button>
                                                        <div className="flex flex-col items-end">
                                                            Dark Mode
                                                        </div>
                                                        <FontAwesomeIcon
                                                            icon={faMoon}
                                                            className="text-lg w-5 h-[1.4rem]"
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        logoutUser();
                                                        handleShowHide();
                                                    }}
                                                >
                                                    <div className="h-12 flex justify-end items-center gap-5 pl-5 hover:bg-border">
                                                        <span className="text">
                                                            Log Out
                                                        </span>
                                                        <FontAwesomeIcon
                                                            className="text-lg w-5 h-6"
                                                            icon={
                                                                faArrowRightFromBracket
                                                            }
                                                        />
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        ""
                                    )}
                                </div>
                            </div>
                        ) : (
                            // log in button -> redirects to login page
                            <Link className="link" to="/login">
                                <button className="text-text w-20 justify-center items-center px-3 rounded-full py-[.434rem] bg-accent">
                                    <span className="font-bold">Log In</span>
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
