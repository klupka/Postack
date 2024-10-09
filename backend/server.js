import express from "express";
import { connectToDatabase } from "./database.js";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";

// imported routes
import userRoutes from "./routes/userRoutes.js";
import forumPostRoutes from "./routes/forumPostRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

// import passport
import passport from "passport";
import "./passport.js";

// define port from env file
const PORT = process.env.PORT || 3000;
const SECRET = process.env.SECRET;
const MONGODB_CONNECT_STRING = process.env.MONGODB_CONNECT_STRING;

// set up app using express
const app = express();

app.set("trust proxy", 1);

// CORS configuration
const corsOptions = {
    origin: "https://postack-40rm.onrender.com", // frontend URL (local: http://localhost:5173/)
    credentials: true, // allows cookies to be sent
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposedHeaders: ["Set-Cookie"],
};

// middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// connect to database
connectToDatabase();

// setup location to store sessions in MongoDB
const sessionStore = MongoStore.create({
    mongoUrl: MONGODB_CONNECT_STRING,
    collectionName: "sessions",
});

// app uses session storing and stores them into MongoDB via sessionStore variable
app.use(
    session({
        secret: SECRET,
        saveUninitialized: false,
        resave: false,
        store: sessionStore,
        proxy: true, // Required for Heroku & Digital Ocean (regarding X-Forwarded-For)
        name: "MyCoolWebAppCookieName", // This needs to be unique per-host.
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // equals 1 day
            httpOnly: true,
            secure: true,
            sameSite: "none", // required for cross-origin cookies
            domain: "postack-40rm.onrender.com",
        },
    })
);

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", "true");
    console.log(`Request URL: ${req.url}, Session ID: ${req.session.id}`);

    next();
});

// passport
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    next();
});

// routes
app.use("/users", userRoutes);
app.use("/forum-posts", forumPostRoutes);
app.use("/comments", commentRoutes);
app.get("/", (req, res) => {
    req.session.cookieName = "example_cookie";
    res.send("Homepage");
});

// listen to port
app.listen(PORT, () => console.log(`-> Server is running on port ${PORT}`));
