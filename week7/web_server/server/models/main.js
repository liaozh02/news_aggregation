var mongoose = require('mongoose');
mongoose.Promise = global.Promise;//Mongoose deprecationwarning
module.exports.connect = (uri) => {
    mongoose.connect(uri);
    var db = mongoose.connection;
    db.on('error', function(err) {
        console.log(`error connecting with mongodb server: ${err}`);
    })
    db.on('open', function() {
        console.log('connected to mongodb server');
    })
    db.on('disconnected', function() {
        mongoose.connect(mongoUrl);
        db = mongoose.connection;
    })

    require('./user');
}