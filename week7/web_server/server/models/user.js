const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    email:{
        type: String,
        index:{unique: true}
    },
    password: String,
    name: String
});

UserSchema.methods.comparePassword = function(password, cb) {
    bcrypt.compare(password, this.password, cb);
}

UserSchema.pre('save', function(next) {
    const user = this;

    //reserve for password modification, not used for current setting
    if(!user.isModified('password')) return next();

    const saltRounds = 10;
    bcrypt.hash(user.password, saltRounds, function(err, hash) {
        if(err) return next(err);
        else {
            user.password = hash;
            return next();
        }
    });
})

module.exorts = mongoose.model("UserInfo", UserSchema);