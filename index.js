const express = require("express");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 8080;

/**
 * 1) Morgan logging middleware
 * PSE: CareerFoundry kërkon logging me Morgan (në terminal), jo me fs/log.txt
 */
app.use(morgan("common"));

/**
 * 2) GET "/" - default textual response
 * PSE: Kërkohet route default në root endpoint
 */
app.get("/", (req, res) => {
  res.send("Welcome to my Movie API!");
});

/**
 * 3) GET "/movies" - returns JSON for top 10 movies
 * PSE: Kërkohet route /movies që kthen JSON
 */
app.get("/movies", (req, res) => {
  res.json([
    { title: "The Godfather", year: 1972, director: "Francis Ford Coppola" },
    { title: "The Dark Knight", year: 2008, director: "Christopher Nolan" },
    { title: "Pulp Fiction", year: 1994, director: "Quentin Tarantino" },
    { title: "Inception", year: 2010, director: "Christopher Nolan" },
    { title: "Fight Club", year: 1999, director: "David Fincher" },
    { title: "Forrest Gump", year: 1994, director: "Robert Zemeckis" },
    { title: "The Matrix", year: 1999, director: "The Wachowskis" },
    { title: "Interstellar", year: 2014, director: "Christopher Nolan" },
    { title: "Gladiator", year: 2000, director: "Ridley Scott" },
    { title: "Parasite", year: 2019, director: "Bong Joon-ho" }
  ]);
});



/**
 * 4) Serve static files from /public
 * PSE: CareerFoundry kërkon të shërbesh documentation.html me express.static
 * Kjo lejon: http://localhost:8080/documentation.html
 */
app.use(express.static("public"));

/**
 * 5) Error-handling middleware (application-level errors)
 * PSE: CareerFoundry kërkon error handler që log-on errors në terminal
 * Shënim: Ky kap vetëm gabime që kalojnë me next(err)
 */
app.use((err, req, res, next) => {
  console.error("Application Error:", err.stack);
  res.status(500).send("Something went wrong!");
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
