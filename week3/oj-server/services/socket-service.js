module.exports = function(io) {

  var socketSessionList = [];
  var sessionToSocketID = [];

  io.on('connection', (socket) => {
    let sessionId = socket.handshake.query.sessionId;
    console.log('sessionId is ' + sessionId + '  socketId :' + socket.id);
    sessionToSocketID[socket.id] = sessionId;
    if(!(sessionId in socketSessionList)) {
      socketSessionList[sessionId] = {
        'participants': []
      }
    }

    socketSessionList[sessionId].participants.push(socket.id);
    console.dir(socketSessionList);

    socket.on('change', (delta) => {
      let sessionId = sessionToSocketID[socket.id];
      console.log('changeText Session :' +  sessionId + delta);
      if(sessionId in socketSessionList) {
          for(id of socketSessionList[sessionId]['participants']) {
            if(id != socket.id) {
              console.log('Emit change to iD ' + id);
              io.to(id).emit('change',delta);
            }
          }
      } else {
        console.log("Error! Cannot bind sessionId to")
      }
    })

  })


}
