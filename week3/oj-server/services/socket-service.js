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

    //After Connection, listen to event;
    socket.on('change', (delta) => {
      forwardEvents('change', socket.id, delta);
/*      let sessionId = sessionToSocketID[socket.id];
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
*/
    })

    socket.on('cursorMove', (cursor) => {
//      let sessionId = sessionToSocketID[socket.id];
//      console.log('cursorMove session: :' +  sessionId + cursor);
      cursor = JSON.parse(cursor);
      cursor['clientId'] = socket.id;
      forwardEvents('cursorMove', socket.id, JSON.stringify(cursor));
/*      if(sessionId in socketSessionList) {
          for(id of socketSessionList[sessionId]['participants']) {
            if(id != socket.id) {
              console.log('Emit cursorMove to iD ' + id);
              io.to(id).emit('cursorMove',JSON.stringfy(cursor));
            }
          }
      } else {
        console.log("Error! Cannot bind sessionId to")
      }
*/
    })

    function forwardEvents(eventName, socketId, dataString) {
      let sessionId = sessionToSocketID[socketId];
      console.log(eventName + 'Session :' +  sessionId + dataString);
      if(sessionId in socketSessionList) {
          for(id of socketSessionList[sessionId]['participants']) {
            if(id != socketId) {
              console.log('Emit change to iD ' + id);
              io.to(id).emit(eventName, dataString);
            }
          }
      } else {
        console.log("Error! Cannot bind sessionId to")
      }
    }



  })

}
