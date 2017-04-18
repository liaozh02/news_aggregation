const User = require('mongoose').model('UserInfo');
const passportLocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const jwtSecret = require('../config/config.json').jwtSecret;

module.exports = new passportLocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
    session: false
  },
  function(req, email, password, done) {
    // request object is now first argument
    const name = req.body.firstname.trim().concat(" ", req.body.lastname.trim());
    const userData = {
        email: email.trim(),
        password: password.trim(),
        name: name
    }
    console.log(userData);

    const newUserInfo = new User(userData);
    newUserInfo.save((err, user, num) => {
      if(err)
        return done(err);
      else{
        const payload = {
                sub: user._id
            };
        const token = jwt.sign(payload, jwtSecret);
        const data = {
                name: user.name
        };
        return done(null, token, data);
      }
    })
  }
);