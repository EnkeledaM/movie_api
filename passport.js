const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Models = require('./models.js');
const passportJWT = require('passport-jwt');

let Users = Models.User;
let JWTStrategy = passportJWT.Strategy;
let ExtractJWT = passportJWT.ExtractJwt;


    // Local Strategy: Login using username and password

    passport.use(
    new LocalStrategy(
        {
            usernameField: "Username",
            passwordField: "Password",
        },
        (username, password, done) => {
    
            Users.findOne({ Username: username })
                .then((user) => {
                    if (!user) {
                        console.log("Incorrect username")
                        return done(null, false, {
                            message: "Incorrect username or password.",
                        })
                    }
                    if (!user.validatePassword(password)) {
                        console.log("Incorrect password")
                        return done(null, false, {
                            message: "Incorrect password.",
                        })
                    }
                    console.log("Finished")
                    return done(null, user)
                })
                .catch((err) => {
                    console.log(err)
                    return done(err)
                })
        }
    )
)
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
