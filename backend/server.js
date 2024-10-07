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

// CORS configuration
const corsOptions = {
    origin: "*", // frontend URL (local: http://localhost:5173/)
    credentials: true, // allows cookies to be sent
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
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
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // equals 1 day
            secure: false,
        },
    })
);

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
