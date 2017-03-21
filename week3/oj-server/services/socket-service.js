var redisClient = require("../modules/redis-client.js");
var Document = require('../modules/index.js');

const TIMEOUT_IN_SECONDS = 3600;
const SNAPSHOT_INTERVAL_MILLESEC = 600000;

module.exports = function(io) {

  var socketSessionList = [];
  var sessionToSocketID = [];
  var documentSessionList = [];
  var sessionPath = "/project2s";
  var defaultContent = {
    'Java': `public class Example() {
      public static void main(String[] args){
        //Type your code here
      }
    }`,
    'C++': `#include <iostream>
    using namespace std;    ​
    int main() {
       // Type your C++ code here
       return 0;
    }`,
    'Python': `class Solution:
      def example():
      # Write your Python code here`
  }

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
       let key = sessionPath + '/' + sessionId;
       redisClient.llen(key, function(length) {
         if(length) {
           console.log("session teminated previously, recover from redis");
           redisClient.lindex(key, 0, function(data) {
              console.log("get latest snapshot from redis", data);
              documentSessionList[sessionId] = new Document(data);
              socketSessionList[sessionId] = {
                'snapShot': data,
                'cachedChangeEvents': [],
                'participants': []
              }   //list
              socketSessionList[sessionId].participants.push(socket.id);
           });  //lindex
         }  //length
         else {
           console.log("creating new session: ", sessionId);
           documentSessionList[sessionId] = new Document(defaultContent['Java']);
           socketSessionList[sessionId] = {
             'snapShot': documentSessionList[sessionId].getValue(),
             'cachedChangeEvents': [],
             'participants': []
           };
           socketSessionList[sessionId].participants.push(socket.id);
         }
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
        socket.emit('snapshot', socketSessionList[sessionId]['snapShot']);
        let changeEvents = socketSessionList[sessionId]['cachedChangeEvents'];
        for(let i = 0; i < changeEvents.length; i++) {
          console.log("changeEvents:    " + changeEvents[i][1]);
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
          if(participants.length == 0) {
            console.log("Last participant leave");
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
              console.log('Emit change to iD ' + participants[i]);
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

  let snapShotInterval = setInterval(function() {
    console.log("Time to save snapshot");
    socketSessionList.forEach(function(element, index, array) {
      console.log("index" + index);
      if(element['snapShot']) {
        let changeEvents = element['cachedChangeEvents'];
        for(let i = 0; i < changeEvents.length; i++) {
          documentSessionList[index].applyDeltas([JSON.parse(changeEvents[i][1])])
        }
        console.log("save sesssion " + index + " snapshot to redis");
        key = sessionPath + '/' + index;
        console.log("snapshotValue", documentSessionList[index].getValue())
        console.log('redis key', key);
        redisClient.lpush(key, documentSessionList[index].getValue(), redisClient.redisPrint);
        redisClient.llen(key, function(length){
          if(length == 1) {
            redisClient.expire(key,  TIMEOUT_IN_SECONDS);
          }
        });

        if(socketSessionList[index]['participants'].length == 0) {
          delete socketSessionList[index];
          console.log("delete socketSessionlist");
        } else{
          console.log("Snapshot save participants" +socketSessionList[index]['participants']);
          socketSessionList[index]['snapShot'] = documentSessionList[index].getValue()
          socketSessionList[index]['cachedChangeEvents'] = [];
        }
      }
    })
  }, SNAPSHOT_INTERVAL_MILLESEC);

}
