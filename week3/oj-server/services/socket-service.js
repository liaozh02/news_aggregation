var redisClient = require("../modules/redis-client.js");
const TIMEOUT_IN_SECONDS = 3600;

module.exports = function(io) {

  var socketSessionList = [];
  var sessionToSocketID = [];
  var sessionPath = "/project1";
//  var nsp = io.of('/problems');

  io.on('connection', (socket) => {
//nsp.on('connection', (socket) => {
    let sessionId = socket.handshake.query.sessionId;
    console.log('sessionId is ' + sessionId + '  socketId :' + socket.id);
    sessionToSocketID[socket.id] = sessionId;

    if(sessionId in socketSessionList) {
      console.log("Join current session: " + sessionId);
      socketSessionList[sessionId].participants.push(socket.id);
      console.log(socketSessionList[sessionId].participants);
    } else {
      redisClient.get(sessionPath + '/' + sessionId, function(data) {
        if(data) {
          console.log("session teminated previously, recover from redis");
          socketSessionList[sessionId] = {
            'cachedChangeEvents': JSON.parse(data),
            'participants': []
          };
        }
        else {
          console.log("creating new session: ", sessionId);
          socketSessionList[sessionId] = {
            'cachedChangeEvents': [],
            'participants': []
          };
        }
        socketSessionList[sessionId].participants.push(socket.id);
        console.log(socketSessionList[sessionId].participants);
      });
    }




    //After Connection, listen to event;
    socket.on('change', (delta) => {
      let sessionId = sessionToSocketID[socket.id];
      if(sessionId in socketSessionList) {
        socketSessionList[sessionId]['cachedChangeEvents'].push(["change",
          delta, Date.now()]);
      }
      forwardEvents('change', socket.id, delta);
    })

    socket.on('cursorMove', (cursor) => {
      cursor = JSON.parse(cursor);
      cursor['clientId'] = socket.id;
      forwardEvents('cursorMove', socket.id, JSON.stringify(cursor));

    })

    socket.on('restoreBuffer', () => {
      let sessionId = sessionToSocketID[socket.id];
      console.log("restoreBuffer for session " + sessionId + " socket: " + socket.id);
      if(sessionId in socketSessionList) {
        let changeEvents = socketSessionList[sessionId]['cachedChangeEvents'];

        for(let i = 0; i < changeEvents.length; i++) {
          socket.emit(changeEvents[i][0], changeEvents[i][1]);
        }
      }
    })

    socket.on('disconnect', function(){
      let sessionId = sessionToSocketID[socket.id];
      console.log('sessionId: ' + sessionId + "socketId: " + socket.id + ' disconnected');
      if(sessionId in socketSessionList) {
        let participants = socketSessionList[sessionId]['participants'];
        let index = participants.indexOf(socket.id);
        if( index >= 0) {
          participants.splice(index, 1);
      //    console.log("After remove:  " + socketSessionList[sessionId].participants);
          if(participants.length == 0) {
            console.log("Last participant leave. Session Close. Save record to Redis");
            let key = sessionPath + '/' + sessionId;
            let value = JSON.stringify(socketSessionList[sessionId]['cachedChangeEvents']);
            redisClient.set(key, value, redisClient.redisPrint);
            redisClient.expire(key, TIMEOUT_IN_SECONDS);
            delete socketSessionList[sessionId];
          }
        }
        else {
          console.log("cannot find socket.id");
        }
      }
    })

    function forwardEvents(eventName, socketId, dataString) {
      let sessionId = sessionToSocketID[socketId];
      console.log(eventName + 'Session :' +  sessionId + "socketId: " + socketId + dataString);
      if(sessionId in socketSessionList) {
          let participants = socketSessionList[sessionId]['participants']
          for(let i = 0; i < participants.length; i++) {
            if(socketId != participants[i]) {
        //      console.log('Emit change to iD ' + participants[i]);
                io.to(participants[i]).emit(eventName, dataString);
      //           nsp.to(participants[i]).emit(eventName, dataString);
            }
          }
      }
      else {
        console.log("Error! Cannot bind sessionId to")
      }
    }
  })
}
