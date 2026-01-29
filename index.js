/**
 * index.js — CareerFoundry Exercise 2.8 (Mongoose + endpoints) — MongoDB Atlas
 */

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = 8080;

// ====== Models ======
const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;

// ====== Middleware ======
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ====== MongoDB Atlas Connection ======
if (!process.env.CONNECTION_URI) {
  console.error("❌ Missing CONNECTION_URI in .env");
  process.exit(1);
}

mongoose.connect(process.env.CONNECTION_URI);

mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB connected");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});

// ====== Root ======
app.get("/", (req, res) => {
  res.send("Welcome to myFlix API");
});

// =====================================================
// MOVIES ENDPOINTS
// =====================================================

// 1) Return a list of ALL movies
app.get("/movies", async (req, res) => {
  await Movies.find()
    .then((movies) => res.status(200).json(movies))
    .catch((err) => res.status(500).send("Error: " + err));
});

// 2) Return data about a single movie by title
// Example: /movies/Title/Silence%20of%20the%20Lambs
app.get("/movies/Title/:Title", async (req, res) => {
  await Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      if (!movie) return res.status(404).send("Movie not found");
      res.status(200).json(movie);
    })
    .catch((err) => res.status(500).send("Error: " + err));
});

// 3) Return data about a genre (description) by name
// Example: /genres/Thriller
app.get("/genres/:Name", async (req, res) => {
  await Movies.findOne({ "Genre.Name": req.params.Name })
    .then((movie) => {
      if (!movie) return res.status(404).send("Genre not found");
      res.status(200).json(movie.Genre);
    })
    .catch((err) => res.status(500).send("Error: " + err));
});

// 4) Return data about a director by name
// Example: /directors/Jonathan%20Demme
app.get("/directors/:Name", async (req, res) => {
  await Movies.findOne({ "Director.Name": req.params.Name })
    .then((movie) => {
      if (!movie) return res.status(404).send("Director not found");
      res.status(200).json(movie.Director);
    })
    .catch((err) => res.status(500).send("Error: " + err));
});

// =====================================================
// USERS ENDPOINTS
// =====================================================

// 5) Allow new users to register
app.post("/users", async (req, res) => {
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) return res.status(400).send(req.body.Username + " already exists");

      return Users.create({
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      })
        .then((createdUser) => res.status(201).json(createdUser))
        .catch((err) => res.status(500).send("Error: " + err));
    })
    .catch((err) => res.status(500).send("Error: " + err));
});

// (Helper) Get all users
app.get("/users", async (req, res) => {
  await Users.find()
    .then((users) => res.status(200).json(users))
    .catch((err) => res.status(500).send("Error: " + err));
});

// 6) Allow users to update their user info
app.put("/users/:Username", async (req, res) => {
  await Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      },
    },
    { new: true }
  )
    .then((updatedUser) => {
      if (!updatedUser) return res.status(404).send("User not found");
      res.status(200).json(updatedUser);
    })
    .catch((err) => res.status(500).send("Error: " + err));
});

// 7) Add a movie to user's favorites
app.post("/users/:Username/movies/:MovieID", async (req, res) => {
  await Users.findOneAndUpdate(
    { Username: req.params.Username },
    { $addToSet: { FavoriteMovies: req.params.MovieID } },
    { new: true }
  )
    .then((updatedUser) => {
      if (!updatedUser) return res.status(404).send("User not found");
      res.status(200).json(updatedUser);
    })
    .catch((err) => res.status(500).send("Error: " + err));
});

// 8) Remove a movie from user's favorites
app.delete("/users/:Username/movies/:MovieID", async (req, res) => {
  await Users.findOneAndUpdate(
    { Username: req.params.Username },
    { $pull: { FavoriteMovies: req.params.MovieID } },
    { new: true }
  )
    .then((updatedUser) => {
      if (!updatedUser) return res.status(404).send("User not found");
      res.status(200).json(updatedUser);
    })
    .catch((err) => res.status(500).send("Error: " + err));
});

// 9) Deregister user
app.delete("/users/:Username", async (req, res) => {
  await Users.findOneAndDelete({ Username: req.params.Username })
    .then((deletedUser) => {
      if (!deletedUser) return res.status(404).send("User not found");
      res.status(200).send(req.params.Username + " was deleted.");
    })
    .catch((err) => res.status(500).send("Error: " + err));
});

// ====== Start Server ======
app.listen(PORT, () => {
  console.log("myFlix API is listening on port " + PORT);
});
