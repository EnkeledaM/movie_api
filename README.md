# myFlix REST API

A production-ready RESTful API built with Node.js and Express for the myFlix movie application.  
This backend service manages movie data, user accounts, authentication, and secure interactions using modern web development best practices.

---

## 🌐 Live Application

**Production API (Heroku):**  
https://test-heroku-exercise-7495d54af436.herokuapp.com  

**API Documentation:**  
https://test-heroku-exercise-7495d54af436.herokuapp.com/documentation.html  

---

## 📂 GitHub Repository

https://github.com/EnkeledaM/movie_api

---

## 🛠 Tech Stack

- **Node.js** – JavaScript runtime
- **Express.js** – REST API framework
- **MongoDB Atlas** – Cloud-hosted database
- **Mongoose** – ODM for MongoDB
- **Passport (Local & JWT Strategy)** – Authentication
- **bcrypt** – Password hashing
- **express-validator** – Input validation
- **CORS** – Cross-origin resource sharing
- **Morgan** – HTTP request logging
- **Heroku** – Cloud deployment platform

---

## 🔐 Security Features

- Passwords are hashed using **bcrypt** before being stored in the database.
- Authentication handled via **JWT (JSON Web Tokens)**.
- Protected routes require a valid Bearer token.
- Sensitive data (DB URI & JWT secret) stored using **environment variables**.
- Input validation prevents invalid or malformed data.
- CORS enabled for secure API access.

---

## 🚀 Key API Endpoints

### Authentication
- `POST /login`  
  Authenticates a user and returns a JWT token.

---

### Movies
- `GET /movies` (JWT required)  
  Returns a list of all movies.

---

### Users
- `POST /users`  
  Register a new user (password is hashed before saving).

- `PUT /users/:Username` (JWT required)  
  Update user information.

---

### Favorites
- `POST /users/:Username/movies/:MovieID` (JWT required)  
  Add a movie to user's favorites.

- `DELETE /users/:Username/movies/:MovieID` (JWT required)  
  Remove a movie from user's favorites.

---

## ✅ Data Validation

- Username must be at least 5 characters and alphanumeric.
- Email must be in valid email format.
- Password is required and securely hashed.
- Validation errors return HTTP 422 responses.

---

## 💻 Local Development Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/EnkeledaM/movie_api.git
cd movie_api

2️⃣ Install dependencies
npm install

3️⃣ Create a .env file in the root directory
CONNECTION_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
PORT=8080

4️⃣ Start the server
npm start


Server runs at:

http://localhost:8080

🧪 Testing

API endpoints can be tested using:

Postman

Heroku live URL

MongoDB Atlas (to verify stored hashed passwords)

☁ Deployment

Backend hosted on Heroku

Database hosted on MongoDB Atlas

Environment variables configured in Heroku dashboard

👩‍💻 Author

Enkeleda Mustafaj
Backend Developer | JavaScript | Node.js | MongoDB

