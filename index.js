const express = require("express");
const path = require("path");

const app = express();
const PORT = 8080;

// Middleware: lexon JSON nga body (për POST/PUT)
app.use(express.json());

// Serve static files from /public (documentation.html, index.html)
app.use(express.static(path.join(__dirname, "public")));

/**
 * ROOT (opsionale)
 * Shkruaj këtë vetëm për të parë shpejt që serveri po punon.
 */
app.get("/", (req, res) => {
  res.send("Welcome to myFlix API");
});

/**
 * =========================
 * MOVIES ENDPOINTS
 * =========================
 */

// 1) Return a list of ALL movies
app.get("/movies", (req, res) => {
  res.send("Successful GET request returning data on all movies");
});

// 2) Return data about a single movie by title
app.get("/movies/:title", (req, res) => {
  res.send(
    `Successful GET request returning data for movie with title: ${req.params.title}`
  );
});

// 3) Return data about a genre by name/title
app.get("/genres/:name", (req, res) => {
  res.send(
    `Successful GET request returning data for genre: ${req.params.name}`
  );
});

// 4) Return data about a director by name
app.get("/directors/:name", (req, res) => {
  res.send(
    `Successful GET request returning data for director: ${req.params.name}`
  );
});

/**
 * =========================
 * USERS ENDPOINTS
 * =========================
 */

// 5) Allow new users to register
app.post("/users", (req, res) => {
  // Ne kete faze s'kemi database. Thjesht konfirmojme veprimin.
  // req.body do te perdoret me vone per te krijuar userin real.
  res.status(201).send("Successful POST request: user would be registered");
});

// 6) Allow users to update their user info (username)
app.put("/users/:username", (req, res) => {
  res.send(
    `Successful PUT request: user ${req.params.username} would be updated`
  );
});

// 7) Allow users to add a movie to their list of favorites
app.post("/users/:username/movies/:movieId", (req, res) => {
  res.send(
    `Movie ${req.params.movieId} was added to ${req.params.username}'s favorites`
  );
});

// 8) Allow users to remove a movie from their list of favorites
app.delete("/users/:username/movies/:movieId", (req, res) => {
  res.send(
    `Movie ${req.params.movieId} was removed from ${req.params.username}'s favorites`
  );
});

// 9) Allow existing users to deregister
app.delete("/users/:username", (req, res) => {
  res.send(`User ${req.params.username} was deregistered`);
});

// Start server
app.listen(PORT, () => {
  console.log(`myFlix API is listening on port ${PORT}`);
});
