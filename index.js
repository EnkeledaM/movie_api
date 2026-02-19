/**
 * index.js — myFlix API (CareerFoundry)
 */
console.log("✅ RUNNING FILE:", __filename);
console.log("✅ RUNNING DIR:", process.cwd());


require("dotenv").config();
const { check, validationResult } = require('express-validator');


const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");

const app = express();

console.log("✅ PO NISEM NGA KY INDEX.JS (me PUT)");
const PORT = process.env.PORT || 8080;

// ===== Middleware =====
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ shtoje këtë
app.use(morgan("common"));
app.use(cors());
app.use(express.static("public"));


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


app.get("/documentation.html", (req, res) => {
  res.sendFile(path.join(__dirname, "documentation.html"));
});


app.get("/routes-check", (req, res) => {
  try {
    // Express mund t’i mbajë routes te app._router OSE te app.router (varësisht versioni)
    const router =
      (app._router && app._router.stack) ||
      (app.router && app.router.stack) ||
      [];

    const routes = router
      .filter((layer) => layer.route && layer.route.path)
      .map((layer) => {
        const methods = Object.keys(layer.route.methods || {})
          .join(",")
          .toUpperCase();
        return `${methods} ${layer.route.path}`;
      });

    return res.status(200).json({
      ok: true,
      has__router: !!app._router,
      has_router: !!app.router,
      routes,
    });
  } catch (err) {
    console.error("routes-check error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
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

// ===== Movies =====
// ✅ JWT required: Get all movies
// ✅ TEMP (Exercise 3.4): JWT removed so React client can fetch movies

app.get("/movies", async (req, res) => {

  try {
    const movies = await Movies.find();
    return res.status(200).json(movies);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error: " + err });
  }
});



/**
 * =========================
 * USERS
 * =========================
 */

// ✅ PUBLIC: Register user (NO JWT here)
app.post(
  "/users",
  [
    check("Username", "Username must be at least 5 characters")
      .isLength({ min: 5 }),
    check("Username", "Username must be alphanumeric")
      .isAlphanumeric(),
    check("Password", "Password is required and must not contain spaces")
      .not().isEmpty()
      .matches(/^\S+$/), // 🚫 no spaces allowed
    check("Email", "Email must be valid")
      .isEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const { Username, Password, Email, Birthday } = req.body;

      const hashedPassword = Users.hashPassword(Password);

      const existingUser = await Users.findOne({ Username });
      if (existingUser) {
        return res.status(400).send(Username + ' already exists');
      }

      const createdUser = await Users.create({
        Username,
        Password: hashedPassword,
        Email,
        Birthday
      });

      return res.status(201).json(createdUser);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: err.message });
    }
  }
);
// ✅ ADD MOVIE TO FAVORITES
app.post(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const updatedUser = await Users.findOneAndUpdate(
        { Username: req.params.Username },
        { $addToSet: { FavoriteMovies: req.params.MovieID } },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json(updatedUser);

    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
);

// ✅ REMOVE MOVIE FROM FAVORITES
app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const updatedUser = await Users.findOneAndUpdate(
        { Username: req.params.Username },
        { $pull: { FavoriteMovies: req.params.MovieID } },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json(updatedUser);

    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
);
  




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

// ✅ JWT required: Update a user by Username
app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  [
    check("Username", "Username must be at least 5 characters").optional().isLength({ min: 5 }),
    check("Username", "Username must be alphanumeric").optional().isAlphanumeric(),
    check("Password", "Password cannot be empty").optional().not().isEmpty(),
    check("Email", "Email must be valid").optional().isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      if (req.body.Password) {
        req.body.Password = Users.hashPassword(req.body.Password);
      }

      const updatedUser = await Users.findOneAndUpdate(
        { Username: req.params.Username },
        { $set: req.body },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json(updatedUser);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: err.message });
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
