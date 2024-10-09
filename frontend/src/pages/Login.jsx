import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompass } from "@fortawesome/free-solid-svg-icons";

// Page: Login
// users enter their credentials to be authenticated
const Login = ({
    setIsAuthenticated,
    setCurrentSortOption,
    setUserData,
    baseURL,
}) => {
    // login endpoint
    const loginUserURL = `${baseURL}/users/login`;
    // check authentication endpoint
    const checkAuthURL = `${baseURL}/users/protected-route`;
    // useState hook to store entered credentials
    const [credentials, setCredentials] = useState({
        username: "",
        password: "",
    });
    // error messages for log in, ex: username taken, etc.
    const [msg, setMsg] = useState("");
    // navigation hook
    const navigate = useNavigate();
    // useState hook to disable button while login request is processing
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    // useState hook to handle a user that is already logged in
    const [isAlreadyLoggedIn, setIsAlreadyLoggedIn] = useState(null);

    // called to log in user after credentials are successfully verified
    const checkAuth = () => {
        axios
            .get(checkAuthURL, { withCredentials: true })
            .then((res) => {
                setIsAuthenticated(true);
                setUserData(res.data.user);
            })
            .catch((err) => {
                setIsAuthenticated(false);
            });
    };

    // navigates user to home/root if they're already logged in
    const checkAuthOnLoad = () => {
        axios
            .get(checkAuthURL, { withCredentials: true })
            .then(() => {
                setIsAlreadyLoggedIn(true);
                navigate("/");
            })
            .catch(() => {
                setIsAlreadyLoggedIn(false);
            });
    };

    // stores credentials as they are typed into the forms
    const handleInput = (event) => {
        setCredentials({
            ...credentials,
            [event.target.name]: event.target.value,
        });
    };

    // verifies and logs user in via endpoint
    const handleSubmit = (event) => {
        setIsLoggingIn(true);
        event.preventDefault();
        if (credentials.username === "" || credentials.password === "") {
            setMsg("Please fill in all fields.");
            setIsLoggingIn(false);
        } else {
            axios
                .post(loginUserURL, credentials, { withCredentials: true })
                .then((res) => {
                    // reset input values to empty. Don't forget to set value variable in <input>
                    setCredentials({
                        username: "",
                        email: "",
                    });
                    setMsg("Login success");
                    checkAuth();
                    setCurrentSortOption("New");
                    navigate("/");
                    setIsLoggingIn(false);
                })
                .catch((err) => {
                    setIsLoggingIn(false);
                    if (err.response.status === 401) {
                        setMsg("Invalid username or password.");
                    }
                });
        }
    };

    // authentication is checked upon load, navigates user to home/root if already logged in
    useEffect(() => {
        checkAuthOnLoad();
    }, []);

    // if authentication has not been checked, display loading animation
    if (isAlreadyLoggedIn === null) {
        return (
            <div className="mx-auto w-full max-w-[1000px] px-auto text-wrap flex flex-col items-center mt-10">
                <div className="animate-fadeInBounce">
                    <FontAwesomeIcon
                        icon={faCompass}
                        className="animate-windUpSpin text-[2.5rem] text-text"
                    />
                </div>
                <div className="mt-5 italic text-placeholderText flex justify-center text-center px-10 text-sm">
                    Just a moment...
                </div>
                <div className="mt-1 italic text-placeholderText flex justify-center text-center px-10 text-sm">
                    The server could take up to 50 seconds to become active
                    again.
                </div>
            </div>
        );
    }
    // if authentication has been checked and user is not already logged in, display forms for login
    else if (isAlreadyLoggedIn === false) {
        return (
            <div className="mx-auto w-full max-w-[950px] px-2 text-wrap animate-slideDown">
                <div className="flex justify-center mt-10">
                    <div className="w-[300px] flex flex-col gap-5">
                        <div className="text-3xl font-semibold">Log In</div>
                        {msg == "" || msg == null ? (
                            ""
                        ) : (
                            <div className="text-accent font-semibold">
                                {msg}
                            </div>
                        )}
                        <div className="">
                            <form
                                onSubmit={handleSubmit}
                                className="flex flex-col"
                            >
                                <span
                                    className={`relative ${
                                        credentials.username
                                            ? ""
                                            : 'after:content-["*"]'
                                    } after:absolute after:top-[1rem] after:left-[5.5rem] after:text-accent after:font-bold after:focus-within:text-transparent`}
                                >
                                    <input
                                        placeholder="Username"
                                        type="text"
                                        onChange={handleInput}
                                        name="username"
                                        value={credentials.username || ""}
                                        className="bg-transparent p-4 pt-6 pb-2 rounded-xl placeholder:text-placeholderText placeholder:fixed placeholder:top-[1rem] placeholder:font-normal focus:text-text focus:outline-none focus:ring-1 focus:ring-primary border border-border focus:border-transparent w-full peer focus:placeholder-transparent"
                                        id="Username"
                                    ></input>
                                    <label
                                        htmlFor="Username"
                                        className={`text-placeholderText text-sm absolute top-[0.2rem] left-4 ${
                                            credentials.username === ""
                                                ? "animate-inputLabelReverse peer-focus:animate-inputLabel"
                                                : ""
                                        }`}
                                    >
                                        Username
                                    </label>
                                </span>
                                <br />
                                <span
                                    className={`relative ${
                                        credentials.password
                                            ? ""
                                            : 'after:content-["*"]'
                                    } after:absolute after:top-[1rem] after:left-[5.2rem] after:text-accent after:font-bold after:focus-within:text-transparent`}
                                >
                                    <input
                                        placeholder="Password"
                                        type="password"
                                        onChange={handleInput}
                                        name="password"
                                        value={credentials.password}
                                        className="bg-transparent p-4 pt-6 pb-2 rounded-xl placeholder:text-placeholderText placeholder:fixed placeholder:top-[1rem] placeholder:font-normal focus:text-text focus:outline-none focus:ring-1 focus:ring-primary border border-border focus:border-transparent w-full peer focus:placeholder-transparent"
                                        id="Password"
                                    ></input>
                                    <label
                                        htmlFor="Password"
                                        className={`text-placeholderText text-sm absolute top-[0.2rem] left-4 ${
                                            credentials.password === ""
                                                ? "animate-inputLabelReverse peer-focus:animate-inputLabel"
                                                : ""
                                        }`}
                                    >
                                        Password
                                    </label>
                                </span>
                                <br />
                                <button
                                    disabled={isLoggingIn ? true : false}
                                    className={
                                        isLoggingIn
                                            ? "bg-border p-2 rounded-xl font-semibold"
                                            : "bg-primary p-2 rounded-xl font-semibold"
                                    }
                                >
                                    Log In
                                </button>
                            </form>
                        </div>
                        <div className="flex flex-col items-center gap-1 mt-2">
                            <div className="font-light">
                                Don't already have an account?
                            </div>
                            <Link
                                to="/register"
                                className="text-accent font-bold"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};

export default Login;
