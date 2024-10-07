import Nav from "./components/Navbar.jsx";
import "./index.css";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Forum from "./pages/Forum.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import PostDetails from "./pages/PostDetails.jsx";
import User from "./pages/User.jsx";
import GlobalNotificationMessage from "./components/GlobalNotificationMessage.jsx";
import { useEffect, useState } from "react";
import CreatePost from "./pages/CreatePost.jsx";
import TabNavigation from "./components/TabNavigation.jsx";
import Following from "./pages/Following.jsx";
import axios from "axios";
import MobileNavigation from "./components/MobileNavigation.jsx";

function App() {
    // backend URL
    const baseURL = "https://postack.onrender.com";
    // frontend URL base
    const baseURLFrontend = "http://localhost:5173";
    // check user authentication endpoint URL
    const checkAuthURL = `${baseURL}/users/protected-route`;
    // useState hook to verify authentication state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // useState hook to store current dark mode value
    const [isDarkMode, setIsDarkMode] = useState(false);
    // useState hook to store current search value
    const [searchValue, setSearchValue] = useState("");
    // useState hook to store current sort option for home page
    const [currentSortOption, setCurrentSortOption] = useState("New");
    // useState hook to store current sort option for following page
    const [currentSortOptionFollowing, setCurrentSortOptionFollowing] =
        useState("New");
    // useState hook to handle visibility of the profile customization window
    const [showProfileCustomization, setShowProfileCustomization] =
        useState(false);
    // useState hook to store active notifications in an array
    const [globalNotificationMessages, setGlobalNotificationMessages] =
        useState([]);
    // useState hook to store the current URL location (frontend)
    const [currentLocationURL, setCurrentLocationURL] = useState("/");
    // navigation hook
    const navigate = useNavigate();
    // useState hook to store authenticated user data which is passed as props to pages and components
    const [globalUserData, setGlobalUserData] = useState(null);

    // check user authentication and set global user data via endpoint
    const checkAuth = () => {
        axios
            .get(checkAuthURL, { withCredentials: true })
            .then((res) => {
                setGlobalUserData(res.data.user);
            })
            .catch(() => {
                setGlobalUserData([]);
            });
    };

    // if at any point a user begins searching, redirect to home/root to continue
    useEffect(() => {
        if (searchValue != "" && location.pathname != "/") {
            navigate("/");
        }
    }, [searchValue]);

    // on load: check user authentication and set global user data
    useEffect(() => {
        checkAuth();
    }, []);

    // determines the value of isDarkMode
    // uses user preference if set
    // if not user preference, device theme is used as default
    useEffect(() => {
        // get device theme
        const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");

        // if user is not logged in
        if (
            globalUserData === null ||
            Object.keys(globalUserData).length <= 0
        ) {
            // set isDarkMode to preference from device
            if (darkThemeMq.matches) setIsDarkMode(true);
            else setIsDarkMode(false);
        }
        // else if user is logged in
        else if (globalUserData || Object.keys(globalUserData).length > 0) {
            // if user has preference set in profile
            if (globalUserData.darkMode != undefined) {
                // set isDarkMode to preference from profile
                setIsDarkMode(globalUserData.darkMode);
            }
            // else if user does not have preference set
            else {
                // set isDarkMode to preference from device
                if (darkThemeMq.matches) setIsDarkMode(true);
                else setIsDarkMode(false);
            }
        }
    }, [globalUserData]);

    // dynamically change the document body color based on isDarkMode value
    if (isDarkMode) {
        document.documentElement.style.setProperty("--bodyColor", "#010618");
    } else {
        document.documentElement.style.setProperty("--bodyColor", "#e7ecfe");
    }

    // used to close the profile customization window when leaving the profile page
    const location = useLocation();
    useEffect(() => {
        setCurrentLocationURL(location.pathname);
        if (
            location.pathname === "/profile" &&
            showProfileCustomization === true
        ) {
            setShowProfileCustomization(false);
        }
    }, [location.pathname]);

    // handles display of global notifications by creating components for each element in the array
    const handleGlobalNotifications = () => {
        if (globalNotificationMessages.length > 0) {
            return globalNotificationMessages.map((msg) => {
                return (
                    <GlobalNotificationMessage
                        key={msg.id}
                        message={msg.text}
                        isDarkMode={isDarkMode}
                    />
                );
            });
        }
        return null;
    };

    return (
        <div className={isDarkMode ? "darkMode" : "lightMode"}>
            <div className="text-text bg-background pb-10">
                <div className="z-50 sm:hidden block">
                    <MobileNavigation currentLocationURL={currentLocationURL} />
                </div>

                <div>
                    <Nav
                        isAuthenticated={isAuthenticated}
                        setIsAuthenticated={setIsAuthenticated}
                        setIsDarkMode={setIsDarkMode}
                        isDarkMode={isDarkMode}
                        setSearchValue={setSearchValue}
                        searchValue={searchValue}
                        userData={globalUserData}
                        setUserData={setGlobalUserData}
                        baseURL={baseURL}
                    />
                </div>

                <div className="flex flex-col gap-2 fixed bottom-[6rem] sm:bottom-[1rem] left-[1rem] sm:left-[calc(1rem+60px)]">
                    {handleGlobalNotifications()}
                </div>

                <div className="pt-[55px] z-40">
                    <TabNavigation currentLocationURL={currentLocationURL} />
                </div>
                <div className="-z-50 sm:mb-[0px] mb-[75px]">
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <div>
                                    <Forum
                                        searchValue={searchValue}
                                        setCurrentSortOption={
                                            setCurrentSortOption
                                        }
                                        currentSortOption={currentSortOption}
                                        setGlobalNotificationMessages={
                                            setGlobalNotificationMessages
                                        }
                                        globalNotificationMessages={
                                            globalNotificationMessages
                                        }
                                        userData={globalUserData}
                                        setUserData={setGlobalUserData}
                                        baseURL={baseURL}
                                        baseURLFrontend={baseURLFrontend}
                                    />
                                </div>
                            }
                        />
                        <Route
                            path="/following"
                            element={
                                <div>
                                    <Following
                                        setCurrentSortOptionFollowing={
                                            setCurrentSortOptionFollowing
                                        }
                                        currentSortOptionFollowing={
                                            currentSortOptionFollowing
                                        }
                                        setGlobalNotificationMessages={
                                            setGlobalNotificationMessages
                                        }
                                        globalNotificationMessages={
                                            globalNotificationMessages
                                        }
                                        userData={globalUserData}
                                        setUserData={setGlobalUserData}
                                        baseURL={baseURL}
                                        baseURLFrontend={baseURLFrontend}
                                    />
                                </div>
                            }
                        />
                        <Route
                            path="/create-post"
                            element={
                                <div>
                                    <CreatePost baseURL={baseURL} />
                                </div>
                            }
                        />
                        <Route
                            path="/forum-post/:id"
                            element={
                                <div>
                                    <PostDetails
                                        setGlobalNotificationMessages={
                                            setGlobalNotificationMessages
                                        }
                                        globalNotificationMessages={
                                            globalNotificationMessages
                                        }
                                        baseURL={baseURL}
                                        baseURLFrontend={baseURLFrontend}
                                    />
                                </div>
                            }
                        />
                        <Route
                            path="/login"
                            element={
                                <div>
                                    <Login
                                        setIsAuthenticated={setIsAuthenticated}
                                        setCurrentSortOption={
                                            setCurrentSortOption
                                        }
                                        setUserData={setGlobalUserData}
                                        baseURL={baseURL}
                                    />
                                </div>
                            }
                        />
                        <Route
                            path="/register"
                            element={
                                <div>
                                    <Register baseURL={baseURL} />
                                </div>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <div>
                                    <Profile
                                        setIsAuthenticated={setIsAuthenticated}
                                        showProfileCustomization={
                                            showProfileCustomization
                                        }
                                        setShowProfileCustomization={
                                            setShowProfileCustomization
                                        }
                                        globalNotificationMessages={
                                            globalNotificationMessages
                                        }
                                        setGlobalNotificationMessages={
                                            setGlobalNotificationMessages
                                        }
                                        baseURL={baseURL}
                                        baseURLFrontend={baseURLFrontend}
                                    />
                                </div>
                            }
                        />
                        <Route
                            path="/user/:username"
                            element={
                                <div>
                                    <User
                                        authUserData={globalUserData}
                                        setAuthUserData={setGlobalUserData}
                                        baseURL={baseURL}
                                        baseURLFrontend={baseURLFrontend}
                                    />
                                </div>
                            }
                        />
                    </Routes>
                </div>
            </div>
        </div>
    );
}

export default App;
