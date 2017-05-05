#-*- coding: utf-8 -*-
import datetime
import hashlib
import json
import os
import redis
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'common'))
CONFIG_FILE = os.path.join(os.path.dirname(__file__), '..', 'config', 'config.json')

import news_api_client
from cloudAMQP_client import CloudAMQPClient

class NewsMonitor:
    def __init__(self):
        with open(CONFIG_FILE, 'r') as f:
            data = json.load(f)
            self.scrape_news_task_queue_url = data['queue']['scrapeNewsTaskQueueUrl']
            self.scrape_news_task_queue_name = data['queue']['scrapeNewsTaskQueueName']
            self.redis_server_host = data['redis']['redisServerHost']
            self.redis_server_port = int(data['redis']['redisServerPort'])
            self.news_timeout_redis_in_seconds = int(data['redis']['newsMonitorExpireInSeconds'])
            self.news_sources = list(data['newsApi']['source'])

    def __call__(self):
        self.redis_client =  redis.StrictRedis(self.redis_server_host, self.redis_server_port)
        self.cloudAMQP_client = CloudAMQPClient(self.scrape_news_task_queue_url, self.scrape_news_task_queue_name)
        news_list = news_api_client.getNewsFromSource(self.news_sources)
        print "call news monitor"
        num_of_new_news = 0
        num_of_old_news = 0

        for news in news_list:
            news_digest = hashlib.md5(news['title'].encode('utf-8')).digest().encode('base-64')

            if self.redis_client.get(news_digest) is None:
                num_of_new_news = num_of_new_news + 1
                news['digest'] = news_digest

                if news['publishedAt'] is None:
                    news['publishedAt'] = datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZZ')

                self.redis_client.set(news_digest, news)
                self.redis_client.expire(news_digest, self.news_timeout_redis_in_seconds)

                self.cloudAMQP_client.sendMessage(news)
            else:
                num_of_old_news = num_of_old_news + 1

        print "Fetched %d new news. %d old news in redis" % (num_of_new_news, num_of_old_news)
        self.cloudAMQP_client.close()

if __name__ == "__main__":
    news_instance = NewsMonitor()
    news_instance()