const jwt = require('jsonwebtoken');
const User = require('mongoose').model('UserInfo');
const passportLocalStrategy = require('passport-local').Strategy;
const jwtSecret = require('../config/config.json').jwtSecret;

module.exports = new passportLocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
    session: false
  },
  function(req, email, password, done) {
    // request object is now first argument
     const userData = {
        email: email.trim(),
        password: password.trim(),
    }
    console.log(userData);

    return User.findOne({email: userData.email}, (err, user)=> {
        //mongoDb error
        if(err) {
            return done(err);
        }
        //cannot find email
        if(!user) {
            return done(null, false, {message: "Incorrect email or password"});
        }

        return user.comparePassword(userData.password, function(err, res){
            if(err) {
                return done(err);
            }
            if(!res) {
                 return done(null, false, {message: "Incorrect email or password"});
            }
            const payload = {
                sub: user._id
            };
            const token = jwt.sign(payload, jwtSecret);
            const data = {
                name: user.name
            };
            return done(null, token, data);
        })
    })
  }
);