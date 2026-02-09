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

const app = express();
console.log("✅ PO NISEM NGA KY INDEX.JS (me PUT)");
const PORT = process.env.PORT || 8080;

// ===== Middleware =====
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ shtoje këtë
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

app.get("/routes-check", (req, res) => {
  try {
    const stack = app._router?.stack || [];

    const routes = stack
      .filter((layer) => layer.route && layer.route.path)
      .map((layer) => {
        const methods = Object.keys(layer.route.methods || {})
          .join(",")
          .toUpperCase();
        return `${methods} ${layer.route.path}`;
      });

    return res.status(200).json({ ok: true, routes });
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
// ✅ JWT required: Get all movies
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



/**
 * =========================
 * USERS
 * =========================
 */

// ✅ PUBLIC: Register user (NO JWT here)
app.post(
  '/users',
  [
    check('Username', 'Username is required (min 5 characters)').isLength({ min: 5 }),
    check('Username', 'Username must be alphanumeric').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email must be valid').isEmail()
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
