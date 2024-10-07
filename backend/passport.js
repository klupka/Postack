import passport from "passport";
import LocalStrategy from "passport-local";
import User from "./models/users.js";
import { validatePassword } from "./passwordUtils.js";

// strategy to verify user credentials
const verifyCallback = (username, password, done) => {
    User.findOne({ username: username })
        .then((user) => {
            // if the user is not found, exit
            if (!user) {
                console.log("User not found");
                return done(null, false);
            }

            // check validation
            const isValid = validatePassword(password, user.hash, user.salt);

            // validation: success
            if (isValid) {
                console.log("User authenticated successfully");
                return done(null, user);
            }
            // validation: fail
            else {
                console.log("Password incorrect");
                return done(null, false);
            }
        })
        .catch((err) => {
            console.log("Error in verifyCallback:", err);
            done(err);
        });
};

// define strategy and have passport use it
const strategy = new LocalStrategy(verifyCallback);
passport.use(strategy);

// express sessions, serialize & deserialize
passport.serializeUser((user, done) => {
    console.log("Serializing user:", user);
    done(null, user.id);
});
passport.deserializeUser((userId, done) => {
    User.findById(userId)
        .then((user) => {
            console.log("Deserializing user:", user);
            done(null, user);
        })
        .catch((err) => done(err));
});
