/**
 * index.js — myFlix API (CareerFoundry)
 */
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

// ===== Middleware =====
app.use(express.json());
app.use(morgan("common"));
app.use(cors());

// ===== Models =====
const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;

// ===== Passport strategies (JWT + Local) =====
require("./passport");

// ===== DB Connection =====
// përdor çfarë ke në .env: CONNECTION_URI ose MONGO_URI
const mongoUri = process.env.CONNECTION_URI || process.env.MONGO_URI;

mongoose.connect(mongoUri, {
  // këto opsione s’janë të detyrueshme në versionet e reja,
  // por nuk prishin punë
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// ===== Routes: root =====
app.get("/", (req, res) => {
  res.send("Welcome to myFlix API");
});

// ===== Auth routes (/login) =====
// auth.js duhet të ekspozojë një funksion: module.exports = (app) => { ... }
require("./auth")(app);

// ===== JWT protected test =====
const passport = require("passport");
app.get(
  "/protected-test",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    return res.status(200).json({ ok: true, user: req.user?.Username });
  }
);

/**
 * =========================
 * USERS
 * =========================
 */

// ✅ PUBLIC: Register user (NO JWT here)
app.post("/users", async (req, res) => {
  try {
    const { Username, Password, Email, Birthday } = req.body;

    if (!Username || !Password) {
      return res.status(400).json({ message: "Username and Password are required" });
    }

    // kontrollo nëse ekziston user me të njëjtin username
    const existingUser = await Users.findOne({ Username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = Users.hashPassword(Password);

    const createdUser = await Users.create({
      Username,
      Password: hashedPassword,
      Email,
      Birthday,
    });

    return res.status(201).json(createdUser);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error: " + err });
  }
});

// ✅ JWT required: Get all users
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const users = await Users.find();
      return res.status(200).json(users);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error: " + err });
    }
  }
);

/**
 * =========================
 * MOVIES (JWT required)
 * =========================
 */

// Get all movies
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const movies = await Movies.find();
      return res.status(200).json(movies);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error: " + err });
    }
  }
);

// Get movie by title
app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const movie = await Movies.findOne({ Title: req.params.Title });
      if (!movie) return res.status(404).json({ message: "Movie not found" });
      return res.status(200).json(movie);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error: " + err });
    }
  }
);

// Get genre by name
app.get(
  "/genres/:Name",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const movie = await Movies.findOne({ "Genre.Name": req.params.Name });
      if (!movie) return res.status(404).json({ message: "Genre not found" });
      return res.status(200).json(movie.Genre);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error: " + err });
    }
  }
);

// Get director by name
app.get(
  "/directors/:Name",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const movie = await Movies.findOne({ "Director.Name": req.params.Name });
      if (!movie) return res.status(404).json({ message: "Director not found" });
      return res.status(200).json(movie.Director);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error: " + err });
    }
  }
);

// ===== Error handler =====
app.use((err, req, res, next) => {
  console.error(err);
  return res.status(500).json({ message: "Something broke!" });
});

// ===== Start server =====
app.listen(PORT, () => {
  console.log(`✅ myFlix API is listening on port ${PORT}`);
});
