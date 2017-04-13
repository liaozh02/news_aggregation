const express = require('express');
const router = express.Router();
const passport = require('passport');
const validator = require('validator');

router.post('/signup', (req, res, next) => {
    const validatorResult = validateSignupForm(req.body);
    if(!validatorResult.success) {
        return res.status(400).json({
            success: false,
            message: validatorResult.message,
            errors: validatorResult.errors
        });
    } 
    console.log("validation ok");
    return passport.authenticate('local-signup', (err, user, info)=>{
        if(err) {
            console.log(err);
            if (err.name === 'MongoError' && err.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: 'Switch to login ?',
                    errors: {
                        email: 'the email is already registered'
                    }
                });
            }
            else {
                return res.status(400).json({
                    success: false,
                    message: 'process form error',
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: "You have successfully signed up!",
            token: user,
            data: info.name
        })
    })(req, res, next);
});

router.post('/login', (req, res, next) => {
    const validatorResult = validateLoginForm(req.body);
    if(!validatorResult.success) {
        return res.status(400).json({
            success: false,
            message: validatorResult.message,
            errors: validatorResult.errors
        });
    } 
    
    return passport.authenticate('local-login', (err, user, info)=>{
        if(err) {
            console.log(err);
            return res.status(400).json({
                success: false,
                message: 'process form error' + err.message,
            });        
        }
        if (user === false) {
            return res.status(400).json({
                success: false,
                message: info.message,
            });  
        }

        return res.status(200).json({
            success: true,
            message: "You have successfully logged in!",
            token: user,
            data: info.name
        })
    })(req, res, next);
})

function validateSignupForm(form) {
    const errors = {};
    let isFormValid = true;
    let message = "";

    if (!form || typeof form.email != 'string' || !validator.isEmail(form.email) ) {
        isFormValid = false;
        errors.email = "Email format is invalid";
    }

    if (typeof form.password != 'string' || form.password.trim().length <8 ) {
        isFormValid = false;
        errors.password = "Password must have atleast 8 characters";
    }

    if(isFormValid) {
        message = "Please check the form for errors";
    }

    return {
        success: isFormValid,
        message,
        errors
    }
}

function validateLoginForm(form) {
    const errors = {};
    let isFormValid = true;
    let message = "";

    if (!form || typeof form.email != 'string' || form.email.trim().length === 0 ) {
        isFormValid = false;
        errors.email = "Please provide your email address";
    }

    if (typeof form.password != 'string' || form.password.trim().length === 0 ) {
        isFormValid = false;
        errors.password = "Please provide your password";
    }

    if(isFormValid) {
        message = "Please check the form for errors";
    }

    return {
        success: isFormValid,
        message,
        errors
    }
}
module.exports = router;