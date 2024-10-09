import React, { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompass } from "@fortawesome/free-solid-svg-icons";

// Page: Register
// users can create an account by providing a unique username with a password
const Register = ({ baseURL }) => {
    // register user endpoint URL
    const registerUserURL = `${baseURL}/users/register`;
    // useState hook to store the new user credentials
    const [newUser, setNewUser] = useState({
        username: "",
        password: "",
    });
    // error messages for registering, ex: username taken, etc.
    const [msg, setMsg] = useState("");
    // navigation hook
    const navigate = useNavigate();
    // useState hook to disable button while login request is processing
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    // check authentication endpoint
    const checkAuthURL = `${baseURL}/users/protected-route`;
    // useState hook to handle a user that is already logged in
    const [isAlreadyLoggedIn, setIsAlreadyLoggedIn] = useState(null);

    // returns true if string contains space or special characters
    const containsSpaceOrSpecialChar = (str) => {
        const regex = /[ !@#$%^&*(),.?":{}|<>]/;
        return regex.test(str);
    };

    // returns true if string contains uppercase characters
    const containsUppercase = (str) => {
        const regex = /[A-Z]/;
        return regex.test(str);
    };

    // stores credentials as they are typed into the forms
    const handleInput = (event) => {
        setNewUser({ ...newUser, [event.target.name]: event.target.value });
    };

    // verifies and registers user via endpoint
    // validates input fields and handles registration errors, ex: username must be 3-16 chars
    const handleSubmit = (event) => {
        setMsg("");
        setIsLoggingIn(true);
        event.preventDefault();

        if (newUser.username === "" || newUser.password === "") {
            setMsg("Please fill in all fields.");
            setIsLoggingIn(false);
        } else if (
            containsSpaceOrSpecialChar(newUser.username) ||
            containsUppercase(newUser.username)
        ) {
            setMsg(
                "Usernames can only contain lowercase letters, numbers, and underscores."
            );
            setIsLoggingIn(false);
        } else if (
            newUser.username.length < 3 ||
            newUser.username.length > 16
        ) {
            setMsg("Username must be between 3 and 16 characters long.");
            setIsLoggingIn(false);
        } else {
            axios
                .post(registerUserURL, newUser)
                .then((res) => {
                    console.log(res);
                    // reset input values to empty. Don't forget to set value variable in <input>
                    setNewUser({
                        username: "",
                    });
                    setMsg("Registered successfully.");
                    navigate("/login");
                    setIsLoggingIn(false);
                })
                .catch((err) => {
                    if (err.status === 409) {
                        setMsg("Username taken");
                    }
                    console.log(err);
                    setIsLoggingIn(false);
                });
        }
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
    // if authentication has been checked and user is not already logged in, display forms for registration
    else if (isAlreadyLoggedIn === false) {
        return (
            <div className="mx-auto w-full max-w-[950px] px-2 text-wrap animate-slideDown">
                <div className="flex justify-center mt-10">
                    <div className="w-[300px] flex flex-col gap-5">
                        <div className="text-3xl font-semibold">Sign Up</div>
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
                                        newUser.username
                                            ? ""
                                            : 'after:content-["*"]'
                                    } after:absolute after:top-[1rem] after:left-[5.5rem] after:text-accent after:font-bold after:focus-within:text-transparent`}
                                >
                                    <input
                                        placeholder="Username"
                                        type="text"
                                        onChange={handleInput}
                                        name="username"
                                        value={newUser.username || ""}
                                        className="bg-transparent p-4 pt-6 pb-2 rounded-xl placeholder:text-placeholderText placeholder:fixed placeholder:top-[1rem] placeholder:font-normal focus:text-text focus:outline-none focus:ring-1 focus:ring-primary border border-border focus:border-transparent w-full peer focus:placeholder-transparent"
                                        id="Username"
                                    ></input>
                                    <label
                                        htmlFor="Username"
                                        className={`text-placeholderText text-sm absolute top-[0.2rem] left-4 ${
                                            newUser.username === ""
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
                                        newUser.password
                                            ? ""
                                            : 'after:content-["*"]'
                                    } after:absolute after:top-[1rem] after:left-[5.2rem] after:text-accent after:font-bold after:focus-within:text-transparent`}
                                >
                                    <input
                                        placeholder="Password"
                                        type="password"
                                        onChange={handleInput}
                                        name="password"
                                        value={newUser.password}
                                        className="bg-transparent p-4 pt-6 pb-2 rounded-xl placeholder:text-placeholderText placeholder:fixed placeholder:top-[1rem] placeholder:font-normal focus:text-text focus:outline-none focus:ring-1 focus:ring-primary border border-border focus:border-transparent w-full peer focus:placeholder-transparent"
                                        id="Password"
                                    ></input>
                                    <label
                                        htmlFor="Password"
                                        className={`text-placeholderText text-sm absolute top-[0.2rem] left-4 ${
                                            newUser.password === ""
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
                                    Sign Up
                                </button>
                            </form>
                        </div>
                        <div className="flex flex-col items-center gap-1 mt-2">
                            <div className="font-light">
                                Already have an account?
                            </div>
                            <Link to="/login" className="text-accent font-bold">
                                Log In
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};

export default Register;
