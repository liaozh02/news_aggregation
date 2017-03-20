var express = require("express")
var app = express()
var restRouter = require("./routes/rest");
var indexRouter = require("./routes/index");
var mongoose = require("mongoose");
var path = require('path')
var http = require('http');

var mongoUrl = "mongodb://alice:alice@ds127260.mlab.com:27260/bittigeralice";
//mongoose.connect("mongodb://alice:alice@ds127260.mlab.com:27260/bittigeralice");
mongoose.connect(mongoUrl);
var db = mongoose.connection;
db.on('error', function() {
    console.log('error connecting with mongodb server');
})
db.on('open', function() {
    console.log('connected to mongodb server');
})
db.on('disconnected', function() {
    mongoose.connect(mongoUrl);
    db = mongoose.connection;
})


app.use(express.static(path.join(__dirname, '../public')));

app.use("/", indexRouter);
app.use("/api/v1", restRouter);

app.use(function(req, res) {
    // send index.html to start client side
    res.sendFile("index.html", { root: path.join(__dirname, '../public/') });
});
/*app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
*/
var server = http.createServer(app);
//var io = require('socket.io')(server, {'pingTimeout': 4000, 'pingInterval': 2000});
var io = require('socket.io')(server);
//var io = require('socket.io')(server, {'path': '/websocket'});

var socketService = require('./services/socket-service.js')(io);

//io.attach(server);
server.listen(3000);

server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
  console.log("Error!!");
  throw error;
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr == 'string'
    ? 'pipe' + addr
    : 'port' + addr.port;
  console.log('Listening on ' + bind);
}
