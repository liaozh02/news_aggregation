var redisClient = require("../modules/redis-client.js");
var Document = require('../modules/index.js');
const uuid = require('uuid/v4');

const TIMEOUT_IN_SECONDS = 36000;
const SNAPSHOT_INTERVAL_MILLESEC = 60000;

module.exports = function(io) {

    var sessionList = [];
    var socketSessionList = [];
    var socketToSessionId = [];
    var socketToUserId = [];
    var documentSessionList = [];
    var sessionPropList = [];
    var sessionPath = "/project3s";
    var defaultContent = {
        'Java': `public class Example {
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
        let client = socket.handshake.query.client;
        let type = socket.handshake.query.type;
        let problemId = socket.handshake.query.problemId;
        console.log('sessionId: ' + sessionId + '  client: ' + client +
            '  socketId: ' + socket.id + '  problem: ' + problemId +
            '  type:' + type);

        if (sessionId == "") {
            let key = sessionPath + '/' + client + '/' + problemId;
            redisClient.get(key, function(data) {
                if (data) {
                    sessionId = data;
                    if (sessionId in socketSessionList) {
                        console.log("Join current session: " + sessionId);
                        if (validateUser(client, sessionPropList[sessionId])) {
                            updateList(sessionId, client, socket.id);
                            socket.emit('create', sessionId);
                        } else {
                            console.log("client:" + client + "not allowed in the session");
                            socket.disconnect(true);
                        }
                    } else {
                        let key = sessionPath + '/' + sessionId;
                        redisClient.llen(key, function(length) {
                            if (length) {
                                redisRestore(sessionId, client, socket.id).then((data) => {
                                        socket.emit('create', data);
                                        sessionList.push(data);
                                    }) //resolve
                                    .catch((res) => {
                                        if (res === "validation") {
                                            socket.disconnect(true);
                                        } else if (res === "session") {
                                            console.log("session data expired, create new record");
                                            createNewSession(sessionId, client, socketId);
                                            redisSave(sessionId);
                                        } else {
                                            console.log(res);
                                        }
                                    }) //reject
                            } else {
                                console.log('record missed! for sessionId:' + sessionId);
                                createNewSession(sessionId, client, socket.id);
                                redisSave(sessionId);
                                socket.emit('create', sessionId);
                            }
                        });
                    }
                } else {
                    sessionId = uuid();
                    console.log("creating new uuid sessionId: ", sessionId);
                    sessionList.push(sessionId);
                    createNewSession(sessionId, client, socket.id);
                    let key = sessionPath + '/' + client + '/' + problemId;
                    redisClient.set(key, sessionId, redisClient.redisPrint);
                    redisClient.expire(key, TIMEOUT_IN_SECONDS);
                    socket.emit('create', sessionId);
                }
            });
        } //No sessionId, create new sesion or restore from database
        else {
            if (sessionId in socketSessionList) { //add new participant
                console.log("Join current session: " + sessionId);
                if (validateUser(client, sessionPropList[sessionId])) {
                    updateList(sessionId, client, socket.id)
                    socket.emit('create', sessionId);
                } else {
                    console.log("client:" + client + "not allowed in the session");
                    socket.disconnect(true);
                }
            } else {
                redisRestore(sessionId, client, socket.id).then(() => {
                        socket.emit('create', sessionId);
                        sessionList.push(sessionId);
                    }) //resolve
                    .catch((res) => {
                        if (res === "validation") {
                            socket.disconnect(true);
                        } else if (res === "session") {
                            console.log("session data Not exist");
                            socket.disconnect(true);
                        } else {
                            console.log(res);
                        }
                    }) //reject
            }
        }

        socket.on('change', (delta) => {
            let sessionId = socketToSessionId[socket.id];
            if (sessionId in socketSessionList) {
                socketSessionList[sessionId]['cachedChangeEvents'].push(["change",
                    delta, Date.now()
                ]);
            }

            forwardEvents('change', socket.id, delta);
        })

        socket.on('cursorMove', (cursor) => {
            cursor = JSON.parse(cursor);
            cursor['clientId'] = socket.id;
            forwardEvents('cursorMove', socket.id, JSON.stringify(cursor));

        })

        socket.on('changeType', (data) => {
            let sessionId = socketToSessionId[socket.id]
            data = JSON.parse(data);
            console.log("session:" + sessionId + 'type change to' + data['type']);
            sessionPropList[sessionId]['type'] = data['type'];
            console.log("session:" + sessionId + 'shareList change to' + data['shareList']);
            sessionPropList[sessionId]['shareList'] = data['shareList'];
            console.log(sessionPropList[sessionId]['shareList']);
            redisSave(sessionId);
        })

        socket.on('restoreBuffer', () => {
            let sessionId = socketToSessionId[socket.id];
            console.log("restoreBuffer for session " + sessionId + " socket: " + socket.id);
            if (sessionId in socketSessionList) {
                //  socket.emit('snapshot', socketSessionList[sessionId]['snapShot']);
                let prop = {
                    'type': sessionPropList[sessionId]['type'],
                    'shareList': sessionPropList[sessionId]['shareList']
                }
                prop = JSON.stringify(prop);
                console.log(prop);
                socket.emit('sessionProp', prop);
                socket.emit('snapshot', documentSessionList[sessionId].getValue());
                let changeEvents = socketSessionList[sessionId]['cachedChangeEvents'];
                console.log(changeEvents);
                for (let i = 0; i < changeEvents.length; i++) {
                    //         console.log("changeEvents:    " + changeEvents[i][1]);
                    socket.emit(changeEvents[i][0], changeEvents[i][1]);
                }
            }
        })

        socket.on('disconnect', function() {
            let sessionId = socketToSessionId[socket.id];
            console.log('sessionId: ' + sessionId + "socketId: " + socket.id + ' disconnected');
            if (sessionId in socketSessionList) {
                let participants = socketSessionList[sessionId]['participants'];
                let index = participants.indexOf(socket.id);
                if (index >= 0) {
                    participants.splice(index, 1);
                    if (participants.length == 0) {
                        console.log("Last participant leave");
                    }
                } else {
                    console.log("cannot find socket.id");
                }
            }
        })


        function forwardEvents(eventName, socketId, dataString) {
            let sessionId = socketToSessionId[socketId];
            //        console.log(eventName + 'Session :' + sessionId + "socketId: " + socketId + dataString);
            if (sessionId in socketSessionList) {
                let participants = socketSessionList[sessionId]['participants']
                for (let i = 0; i < participants.length; i++) {
                    if (socketId != participants[i]) {
                        //     console.log('Emit change to iD ' + participants[i]);
                        io.to(participants[i]).emit(eventName, dataString);
                        //           nsp.to(participants[i]).emit(eventName, dataString);
                    }
                }
            } else {
                console.log("Error! Cannot bind sessionId to")
            }
        }

        function redisRestore(sessionId, client, socketId) {
            return new Promise((resolve, reject) => {
                console.log('session teminated previously, recover from redis');
                let key = sessionPath + '/' + sessionId;
                redisClient.lindex(key, 0, function(data) {
                    if (data) {
                        console.log('get latest data from redis', data);
                        data = JSON.parse(data);
                        if (data['owner'] != client) {
                            console.log("Alert!!user-session record not match! Begin Vaidation")
                            if (!validateUser(client, data)) {
                                reject("validation");
                            }
                        } else {
                            console.log(client + " reconnect");
                        }
                        documentSessionList[sessionId] = new Document(data['snapShot']);
                        sessionPropList[sessionId] = {
                            'owner': data['owner'],
                            'type': data['type'],
                            'shareList': data['shareList']
                        }
                        socketSessionList[sessionId] = {
                                'cachedChangeEvents': [],
                                'participants': [],
                            } //list
                        updateList(sessionId, client, socketId);
                        resolve(sessionId);
                    } else {
                        console.log("data expired Or not exist");
                        reject("session");
                    }
                });
            });
        }

        function createNewSession(sessionId, client, socketId) {
            console.log("create new session:" + sessionId + " client:" + client +
                " socketId:" + socketId)
            documentSessionList[sessionId] = new Document(defaultContent['Java']);
            socketSessionList[sessionId] = {
                'cachedChangeEvents': [],
                'participants': []
            };
            sessionPropList[sessionId] = {
                'owner': client,
                'type': 'PRIVATE',
                'shareList': []
            }
            updateList(sessionId, client, socketId);
        }

        function validateUser(client, sessionProp) {
            if (sessionProp['owner'] != client) {
                if (sessionProp['type'] === 'PRIVATE') {
                    return false;
                } else if ((sessionProp['type'] === 'SHARE') &&
                    (sessionProp['shareList'].indexOf(client) < 0)) {
                    return false;
                } else {
                    console.log("new client " + client + "joined session owned by" + sessionProp['owner']);
                    return true;
                }
            } else {
                console.log("owner " + sessionProp['owner'] + " reconnect");
                return true;
            }
        }

        function updateList(sessionId, client, socketId) {
            socketSessionList[sessionId].participants.push(socketId);
            socketToUserId[socketId] = client;
            socketToSessionId[socketId] = sessionId;
        }
    })

    function redisSave(index) {
        let key = sessionPath + '/' + index;
        console.log('redis key', key);
        let data = {
            'owner': sessionPropList[index]['owner'],
            'type': sessionPropList[index]['type'],
            'shareList': sessionPropList[index]['shareList'],
            'snapShot': documentSessionList[index].getValue()
        }
        data = JSON.stringify(data);
        console.log("redis save " + data);
        redisClient.lpush(key, data, redisClient.redisPrint);
        redisClient.llen(key, function(length) {
            if (length == 1) {
                redisClient.expire(key, TIMEOUT_IN_SECONDS);
            }
        });
    }

    let snapShotInterval = setInterval(function() {
        console.log("Time to save snapshot");
        sessionList.forEach(function(element, index, array) {
            console.log("index: " + index + " sessionId:" + element);
            let sessionId = element;
            let changeEvents = socketSessionList[sessionId]['cachedChangeEvents'];
            for (let i = 0; i < changeEvents.length; i++) {
                documentSessionList[sessionId].applyDeltas([JSON.parse(changeEvents[i][1])])
            }
            console.log("save sesssion " + index + " snapshot to redis");
            redisSave(sessionId);
            if (socketSessionList[sessionId]['participants'].length == 0) {
                delete socketSessionList[sessionId];
                delete documentSessionList[sessionId];
                sessionList.splice(index, 1);
                console.log("delete socketSessionlist");
            } else {
                console.log("Snapshot save participants" + socketSessionList[sessionId]['participants']);
                socketSessionList[sessionId]['cachedChangeEvents'] = [];
            }

        })
    }, SNAPSHOT_INTERVAL_MILLESEC);

}