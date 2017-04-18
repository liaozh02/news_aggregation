var express = require('express');
var router = express.Router();
var rpc_client = require('../rpc_client/rpc_client');

/* GET users listing. */
router.get('/userId/:userId/pageNum/:pageNum', function(req, res, next) {
    user_id = req.params.userId;
    page_num = req.params.pageNum;
    console.log("Fetching new: userId: " + user_id + " pageNum: " + page_num);
    rpc_client.getNewssummaryForuser(user_id, page_num, function(response){
        res.json(response);
    })

});

module.exports = router;
