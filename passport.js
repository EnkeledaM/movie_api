const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Models = require('./models.js');
const passportJWT = require('passport-jwt');

const Users = Models.User;
let JWTStrategy = passportJWT.Strategy;
let ExtractJWT = passportJWT.ExtractJwt;



    // Local Strategy: Login using username and password

passport.use(
  new LocalStrategy(
    {
      usernameField: 'Username',
      passwordField: 'Password',
    },
    async (username, password, done) => {
      try {
        const user = await Users.findOne({ Username: username });

        if (!user) {
          return done(null, false, { message: 'Incorrect username or password.' });
        }

        // ✅ KJO ËSHTË PIKA KRYESORE
        if (!user.validatePassword(password)) {
          return done(null, false, { message: 'Incorrect username or password.' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// JWT Strategy: Authenticate using JSON Web Tokens

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'your_jwt_secret',
    },
    (jwtPayload, done) => {
      return Users.findById(jwtPayload._id)
        .then((user) => done(null, user))
        .catch((err) => done(err));
    }
  )
);
