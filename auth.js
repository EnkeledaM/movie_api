const jwtSecret = 'your_jwt_secret'; // same key used in JWTStrategy

const jwt = require('jsonwebtoken');
const passport = require('passport');
require('./passport');

module.exports = (app) => {
  app.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }

      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }

        const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
          expiresIn: '7d'
        });

        return res.json({ user, token });
      });
    })(req, res);
  });
};
