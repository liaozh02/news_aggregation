import json
import os
import sys
import redis
import pickle
from datetime import datetime
from bson.json_util import dumps

# import common package in parent directory
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'common'))

import mongodb_client
from cloudAMQP_client import CloudAMQPClient
import news_recommendation_service_client

MONGODB_SERVER_HOST = 'localhost'
MONGODB_SERVER_PORT = 4040
REDIS_SERVER_HOST = 'localhost'
REDIS_SERVER_PORT = 6379
REDIS_NEWS_EXPIRE_IN_SECONDS = 600

NEWS_LIMIT = 100
NEWS_PER_PAGE_SIZE = 10
NEWS_DB_COLLECTION = 'news'
CLICKS_DB_COLLECTION = 'clicks'

LOG_CLICKS_TASK_QUEUE_URL = "amqp://kqtmbtso:4ilOUR7nFjfN_hJ11IIJMDJqLZVfx5sE@donkey.rmq.cloudamqp.com/kqtmbtso"
LOG_CLICKS_TASK_QUEUE_NAME = 'tap-news-log-clicks-task-queue'

redis_client = redis.StrictRedis(REDIS_SERVER_HOST, REDIS_SERVER_PORT)
CloudAMQPClient = CloudAMQPClient(LOG_CLICKS_TASK_QUEUE_URL, LOG_CLICKS_TASK_QUEUE_NAME)

def getNewssummaryForuser(userId, pageNum):
    print "get news for user: %s @ page %s" % (userId, pageNum)
    pageNum = int(pageNum)
    startIndex = (pageNum - 1) * NEWS_PER_PAGE_SIZE
    endIndex = pageNum * NEWS_PER_PAGE_SIZE

    sliced_news = []
    if redis_client.get(userId) is not None:
        news_digest = pickle.loads(redis_client.get(userId))
        sliced_news_digest = news_digest[startIndex: endIndex]
        db = mongodb_client.get_db()
        sliced_news = list(db[NEWS_DB_COLLECTION].find({'digest': {'$in': sliced_news_digest}}))
    else:
        db = mongodb_client.get_db()
        total_news = list(db[NEWS_DB_COLLECTION].find().sort([('publishedAt', -1)]).limit(NEWS_LIMIT))
        total_news_digest = list(map(lambda x: x['digest'], total_news)) 
        print total_news_digest

        redis_client.set(userId, pickle.dumps(total_news_digest))
        redis_client.expire(userId, REDIS_NEWS_EXPIRE_IN_SECONDS)

        sliced_news = total_news[startIndex: endIndex]

    #get preference for user
    preference = news_recommendation_service_client.getPreferenceForuser(userId)
    topPreference = None

    if preference is not None and len(preference) > 0:
        topPreference = preference[0]
    
    for news in sliced_news:
        del news['text']
        if news['class'] == topPreference:
            news['reason'] = 'Recommend'
        if news['publishedAt'].date() == datetime.today().date():
            news['time'] = 'Today'
    return json.loads(dumps(sliced_news))


def logNewsclickForuser(userId, newsId):
    message = {'userId': userId, 'newsId': newsId, 'timestamp': datetime.utcnow()}
    db = mongodb_client.get_db()
    #save original record
    db[CLICKS_DB_COLLECTION].insert(message)

    message = {'userId': userId, 'newsId': newsId, 'timestamp': str(datetime.utcnow())}
    CloudAMQPClient.sendMessage(message)
    