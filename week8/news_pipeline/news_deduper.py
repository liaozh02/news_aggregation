# -*- coding: utf-8 -*-
import datetime
import json
import os
import sys

from dateutil import parser
from sklearn.feature_extraction.text import TfidfVectorizer

# import common package in parent directory
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'common'))
CONFIG_FILE = os.path.join(os.path.dirname(__file__), '..', 'config', 'config.json')

import mongodb_client
from cloudAMQP_client import CloudAMQPClient
import news_topic_modeling_service_client

class NewsDeduper:
    def __init__(self):
        with open(CONFIG_FILE, 'r') as f:
            data = json.load(f)
            self.dedupe_news_task_queue_url = data['queue']['dedupeNewsTaskQueueUrl']
            self.dedupe_news_task_queue_name = data['queue']['dedupeNewsTaskQueueName']
            self.sleep_time_in_seconds = int(data['queue']['dedupeNewsTaskSleepTime'])
            self.collection = data['mongoDb']['newsMongoDbCollection']
            self.sameNewsThreshold = float(data['newsDedupe']['sameNewsThreshold'])

    def handle_messages(self, msg):
        print "handle message from dedupe queue"
        if msg is None or not isinstance(msg, dict):
            print "message is broken"
            return False
        
        task = msg
        text = str(task['text'].encode('utf-8'))
        if text is None:
            return False

        #Get all recent news 
        published_at = parser.parse(task['publishedAt'])
        published_at_day_begin = datetime.datetime(published_at.year, published_at.month, published_at.day, 0, 0, 0, 0)
        published_at_day_end = published_at_day_begin + datetime.timedelta(days=1)
        recent_news_list = list(self.db[self.collection].find({'publishedAt':{'$gte':published_at_day_begin, '$lt': published_at_day_end}}))
        print "get recent news list"
        if recent_news_list is not None and len(recent_news_list) > 0:
            documents = [str(news['text'].encode('ascii', 'ignore')) for news in recent_news_list]
            documents.insert(0, text)

            #caculate similarity matrix
            tfidf = TfidfVectorizer().fit_transform(documents)
            pairwise_sim = tfidf * tfidf.T
            print pairwise_sim.A
            rows, _ = pairwise_sim.shape

            for row in range(1, rows):
                if pairwise_sim[row, 0] > self.sameNewsThreshold:
                    # Duplicated news. Ignore.
                    print "Duplicated news. Ignore."
                    return False
        task['publishedAt'] = parser.parse(task['publishedAt'])
        title = task['title'].encode('ascii', 'ignore')
        print title
        if title is not None:
            topic = news_topic_modeling_service_client.classify(title)
            task['class'] = topic

        self.db[self.collection].replace_one({'digest': task['digest']}, task, upsert=True)
        return True

    def __call__(self):      
        self.cloudAMQP_client = CloudAMQPClient(self.dedupe_news_task_queue_url, self.dedupe_news_task_queue_name)
        self.db = mongodb_client.get_db()
        num_unique_news = 0
        while True:
            if self.cloudAMQP_client is not None:
                msg = self.cloudAMQP_client.getMessage()
                if msg is not None:
                    # Parse and process the task
                    try:
                        if self.handle_messages(msg):
                            num_unique_news += 1
                        else:
                            print "invalid msg"
                    except Exception as e:
                        print e
                        pass
                    self.cloudAMQP_client.sleep(self.sleep_time_in_seconds)
                else:
                    print "Store %d unique news in mongoDb" % num_unique_news
                    self.cloudAMQP_client.close()
                    break

if __name__ == "__main__":
    news_instance = NewsDeduper()
    news_instance()