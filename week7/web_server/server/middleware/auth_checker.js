const jwt = require('jsonwebtoken');
const User = require('mongoose').model('UserInfo');
const passportLocalStrategy = require('passport-local').Strategy;
const jwtSecret = require('../config/config.json').jwtSecret;

module.exports = (req, res, next) => {
    if(!req.headers.authorization) {
        res.status(401).end();
    }

    const token = req.headers.authorization.split(" ")[1];
    console.log("req token: " + token);

    return jwt.verify(token, jwtSecret, (err, decoded)=> {
        if(err) {
            return res.status(401).end();
        }
        const email = decoded.sub;

        return User.findById(email, (err, user) => {
            if(err || !user) {
                return res.status(401).end();
            }
            return next();
        })
    })
}