var jayson = require('jayson');

// create a client 
var client = jayson.client.http({
    port: 4040,
    hostname: 'localhost'
});

// invoke "add" 
function add(a, b, callback) {
    client.request('add', [a, b], function(err, response) {
        if (err) throw err;
        console.log(response.result);
        callback(response.result);
    });
}

function getNewssummaryForuser(userId, pageNum, callback) {
    client.request('getNewssummaryForuser', [userId, pageNum], function(err, response) {
        if(err) throw err;
   //     console.log(response);
        callback(response.result);
    });
}

module.exports = {
    add: add,
    getNewssummaryForuser:getNewssummaryForuser
}