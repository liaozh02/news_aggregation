#-*- coding: utf-8 -*-
import datetime
import json
import os
import redis
import sys
import hashlib

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'common'))
CONFIG_FILE = os.path.join(os.path.dirname(__file__), '..', 'config', 'config.json')

import news_api_client
from cloudAMQP_client import CloudAMQPClient


with open(CONFIG_FILE, 'r') as f:
    data = json.load(f)
    SCRAPE_NEWS_TASK_QUEUE_URL = data['queue']['scrapeNewsTaskQueueUrl']
    SCRAPE_NEWS_TASK_QUEUE_NAME = data['queue']['scrapeNewsTaskQueueName']
    SLEEP_TIME_IN_SECONDS = int(data['queue']['scrapeNewsTaskSleepTime'])
    REDIS_SERVER_HOST = data['redis']['redisServerHost']
    REDIS_SERVER_PORT = int(data['redis']['redisServerPort'])
    NEWS_TIMEOUT_REDIS_IN_SECONDS = int(data['redis']['newsMonitorExpireInSeconds'])

NEWS_SOURCES = [
    'bbc-news',
    'bbc-sport',
    'bloomberg',
    'cnn',
    'entertainment-weekly',
    'espn',
    'ign',
    'techcrunch',
    'the-new-york-times',
    'the-wall-street-journal',
    'the-washington-post'
]

redis_client =  redis.StrictRedis(REDIS_SERVER_HOST, REDIS_SERVER_PORT)
cloudAMQP_client = CloudAMQPClient(SCRAPE_NEWS_TASK_QUEUE_URL, SCRAPE_NEWS_TASK_QUEUE_NAME)

while True:
    news_list = news_api_client.getNewsFromSource(NEWS_SOURCES)

    num_of_new_news = 0
    num_of_old_news = 0

    for news in news_list:
        news_digest = hashlib.md5(news['title'].encode('utf-8')).digest().encode('base-64')

        if redis_client.get(news_digest) is None:
            num_of_new_news = num_of_new_news + 1
            news['digest'] = news_digest

            if news['publishedAt'] is None:
                news['publishedAt'] = datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZZ')

            redis_client.set(news_digest, news)
            redis_client.expire(news_digest, NEWS_TIMEOUT_REDIS_IN_SECONDS)

            cloudAMQP_client.sendMessage(news)
        else:
            num_of_old_news = num_of_old_news + 1

    print "Fetched %d new news." % num_of_new_news
    print "%d old news." % num_of_old_news

    cloudAMQP_client.sleep(SLEEP_TIME_IN_SECONDS)