const express = require("express");
const app = express();
const cors = require("cors");
const bcrypt = require("bcrypt");
const axios = require("axios");
const session = require("express-session");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const moment = require("moment");
require("express-async-errors");

dotenv.config();
mongoose.set("strictQuery", false);
app.enable("trust proxy");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_STRING, { useNewUrlParser: true });
        console.log("Database connection established successfully.");
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
};

// Import custom error classes
const {
    DatabaseError,
    AuthError,
    PokemonNoSuchRouteError,
    BadRequest,
} = require("./errors.js");

// Import models
const User = require("./models/User.js");
const Request = require("./models/Request.js");
const ErrorLog = require("./models/Error.js");

// Middleware configuration
const MongoDBStore = require("connect-mongodb-session")(session);
const store = new MongoDBStore({
    uri: process.env.DB_STRING,
    collection: "sessions",
});

app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
    "http://localhost:8000",
    "https://pokedex-salesp07.netlify.app",
];
app.use(
    cors({
        origin: allowedOrigins,
        methods: ["POST", "GET", "PATCH", "OPTIONS"],
        credentials: true,
    })
);

app.use(
    session({
        name: "sessionID",
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 600000,
            httpOnly: true,
            secure: true,
            sameSite: "none",
        },
        store: store,
    })
);

// Utility Middleware
const isLoggedIn = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return next();
    }
    return res.status(401).json({ error: "User not logged in." });
};

const isAdmin = (req, res, next) => {
    if (req.session.user?.isAdmin) {
        return next();
    }
    return res.status(403).json({ error: "Admin privileges required." });
};

const logRequest = async (req, res, next) => {
    try {
        await Request.create({
            username: req.session.user.username,
            endpoint: `${req.originalUrl}[${req.method}]`,
        });
    } catch (error) {
        console.error("Error logging request:", error);
    }
    next();
};

// Centralized Error Handling Middleware
const handleErr = async (err, req, res, next) => {
    if (err.name === "MongoServerError" || err.name === "MongoError") {
        err = new DatabaseError(err.message);
    }
    try {
        await ErrorLog.create({
            username: req.session?.user?.username || "anonymous",
            name: err.name,
            endpoint: `${req.originalUrl}[${req.method}]`,
            code: err.code || 500,
        });
    } catch (error) {
        console.error("Failed to log error:", error);
    }
    console.error(err.message);
    res.status(err.code || 500).json({ error: err.message });
};

// Routes
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const userExists = await User.findOne({ username });
    if (userExists) throw new AuthError("Username already taken.");
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });
    req.session.user = user;
    req.session.isLoggedIn = true;
    res.json({ message: "Registration successful." });
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new AuthError("Invalid username or password.");
    }
    req.session.user = user;
    req.session.isLoggedIn = true;
    res.json({ redirect: user.isAdmin ? "/admin" : "/pokemons" });
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.json({ message: "Logged out successfully." });
});

app.get("/getSessionInfo", (req, res) => {
    res.json({
        isAdmin: req.session.user?.isAdmin || false,
        isLoggedIn: req.session.isLoggedIn || false,
    });
});

app.get("/pokemons", isLoggedIn, logRequest, async (req, res) => {
    const typesResponse = await axios.get(
        "https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/types.json"
    );
    const pokemonsResponse = await axios.get(
        "https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json"
    );
    res.json({
        pokemons: pokemonsResponse.data,
        types: typesResponse.data.map((type) => type.english),
    });
});

// Add other routes here following the same format...

// Fallback route
app.get("*", () => {
    throw new PokemonNoSuchRouteError("Route not found.");
});

// Start the server
connectDB().then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`);
    });
});
