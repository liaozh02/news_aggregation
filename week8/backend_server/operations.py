import json
import os
import sys
import redis
import pickle
from datetime import datetime
from bson.json_util import dumps
import operator
# import common package in parent directory
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'common'))
CONFIG_FILE = os.path.join(os.path.dirname(__file__), '..', 'config', 'config.json')

import mongodb_client
from cloudAMQP_client import CloudAMQPClient
import news_recommendation_service_client
from statsd import StatsClient

WEIGHT_PAGE = 0.9
with open(CONFIG_FILE, 'r') as f:
    data = json.load(f)
    REDIS_SERVER_HOST = data['redis']['redisServerHost']
    REDIS_SERVER_PORT = int(data['redis']['redisServerPort'])
    REDIS_NEWS_EXPIRE_IN_SECONDS = int(data['redis']['newsExpireInSeconds'])
    NEWS_LIMIT = int(data['news']['newsLimit'])
    NEWS_PER_PAGE_SIZE = int(data['news']['newsPageSize'])
    NEWS_DB_COLLECTION = data['mongoDb']['newsMongoDbCollection']
    CLICKS_DB_COLLECTION = data['mongoDb']['clicksMongoDbCollection']
    LOG_CLICKS_TASK_QUEUE_URL = data['queue']['logClicksTaskQueueUrl']
    LOG_CLICKS_TASK_QUEUE_NAME = data['queue']['logClicksTaskQueueName']

redis_client = redis.StrictRedis(REDIS_SERVER_HOST, REDIS_SERVER_PORT)
CloudAMQPClient = CloudAMQPClient(LOG_CLICKS_TASK_QUEUE_URL, LOG_CLICKS_TASK_QUEUE_NAME)
statsd = StatsClient()
news_timer = statsd.timer('news')

def isclose(a, b, rel_tol=1e-09, abs_tol=0.0):
    return abs(a-b) <= max(rel_tol * max(abs(a), abs(b)), abs_tol) 

def getNewssummaryForuser(userId, pageNum):
    news_timer.start()
    print "get news for user: %s @ page %s" % (userId, pageNum)
    statsd.incr("user.news")
    pageNum = int(pageNum)
    startIndex = (pageNum - 1) * NEWS_PER_PAGE_SIZE
    endIndex = pageNum * NEWS_PER_PAGE_SIZE

    sliced_news = []
    #get preference for user
    pref_dict = news_recommendation_service_client.getPreferenceForuser(userId)
    #sort Preflist
    if pref_dict is not None and len(pref_dict) > 0:
        sorted_tuple = sorted(pref_dict.items(), key=operator.itemgetter(1), reverse=True)
        sorted_value_list = [x[1] for x in sorted_tuple]
        sorted_pref_list = [x[0] for x in sorted_tuple]

    topPreference = None

    if redis_client.get(userId) is not None:
        news_digest = pickle.loads(redis_client.get(userId))
        sliced_news_digest = news_digest[startIndex: endIndex]
        db = mongodb_client.get_db()
        sliced_news = list(db[NEWS_DB_COLLECTION].find({'digest': {'$in': sliced_news_digest}}))
    else:
        db = mongodb_client.get_db()
        total_news = list(db[NEWS_DB_COLLECTION].find().sort([('publishedAt', -1)]).limit(NEWS_LIMIT))            
        if isclose(sorted_value_list[0], sorted_value_list[-1]):
            print "News User. No Preference"
        else:
            #sort News accorging to user preference
            #weight = WEIGHT_PAGE**(pageNum-1)
            sorted_news = sorted(total_news, 
               key=lambda x: 0.9** (total_news.index(x) / NEWS_PER_PAGE_SIZE) * pref_dict[x['class']],
              # key=lambda x: pref_dict[x['class']],    
                   reverse=True)
            topPreference = sorted_pref_list[0]  
        
        total_news_digest = list(map(lambda x: x['digest'], sorted_news)) 
        #print total_news_digest

        redis_client.set(userId, pickle.dumps(total_news_digest))
        redis_client.expire(userId, REDIS_NEWS_EXPIRE_IN_SECONDS)

        sliced_news = sorted_news[startIndex: endIndex]

    for news in sliced_news:
        del news['text']
        if news['class'] == topPreference:
            news['reason'] = 'Recommend'
        if news['publishedAt'].date() == datetime.today().date():
            news['time'] = 'Today'
    
    news_timer.stop()
    return json.loads(dumps(sliced_news))


def logNewsclickForuser(userId, newsId):
    message = {'userId': userId, 'newsId': newsId, 'timestamp': datetime.utcnow()}
    db = mongodb_client.get_db()
    #save original record
    db[CLICKS_DB_COLLECTION].insert(message)

    message = {'userId': userId, 'newsId': newsId, 'timestamp': str(datetime.utcnow())}
    CloudAMQPClient.sendMessage(message)
    