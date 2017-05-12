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

router.post('/userId/:userId/newsId/:newsId', function(req, res, next) {
    user_id = req.params.userId;
    news_id = decodeURIComponent(req.params.newsId);
    console.log("Logging news click: userId: " + user_id + " newsId: " + news_id);
    rpc_client.logNewsclickForuser(user_id, news_id);
    res.status(200).end();
}); 

/*router.post('/userId/:userId/log', function(req, res, next) {
    console.log(req.query);
    user_id = req.params.userId;
    news_id = req.query.newsId;
    console.log("Logging news click: userId: " + user_id + " newsId: " + news_id);
    rpc_client.logNewsclickForuser(user_id, news_id);
    res.status(200).end();
});
*/
module.exports = router;
