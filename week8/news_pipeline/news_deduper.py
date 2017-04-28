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

with open(CONFIG_FILE, 'r') as f:
    data = json.load(f)
    DEDUPE_NEWS_TASK_QUEUE_URL = data['queue']['dedupeNewsTaskQueueUrl']
    DEDUPE_NEWS_TASK_QUEUE_NAME = data['queue']['dedupeNewsTaskQueueName']
    SLEEP_TIME_IN_SECONDS = int(data['queue']['dedupeNewsTaskSleepTime'])
    NEWS_DB_COLLECTION = data['mongoDb']['newsMongoDbCollection']
    SAME_NEWS_SIMILARITY_THRESHOLD = float(data['newsDedupe']['sameNewsThreshold'])

cloudAMQP_client = CloudAMQPClient(DEDUPE_NEWS_TASK_QUEUE_URL, DEDUPE_NEWS_TASK_QUEUE_NAME)

def handle_messages(msg):
    if msg is None or not isinstance(msg, dict):
        print "message is broken"
        return
    
    task = msg
    text = str(task['text'].encode('utf-8'))
    if text is None:
        return

    #Get all recent news 
    published_at = parser.parse(task['publishedAt'])
    published_at_day_begin = datetime.datetime(published_at.year, published_at.month, published_at.day, 0, 0, 0, 0)
    published_at_day_end = published_at_day_begin + datetime.timedelta(days=1)

    db = mongodb_client.get_db()
    recent_news_list = list(db[NEWS_DB_COLLECTION].find({'publishedAt':{'$gte':published_at_day_begin, '$lt': published_at_day_end}}))

    if recent_news_list is not None and len(recent_news_list) > 0:
        documents = [str(news['text'].encode('utf-8')) for news in recent_news_list]
        documents.insert(0, text)

        #caculate similarity matrix
        tfidf = TfidfVectorizer().fit_transform(documents)
        pairwise_sim = tfidf * tfidf.T
        print pairwise_sim.A
        rows, _ = pairwise_sim.shape

        for row in range(1, rows):
            if pairwise_sim[row, 0] > SAME_NEWS_SIMILARITY_THRESHOLD:
                # Duplicated news. Ignore.
                print "Duplicated news. Ignore."
                return
    task['publishedAt'] = parser.parse(task['publishedAt'])

    title = task['title']
    if title is not None:
        topic = news_topic_modeling_service_client.classify(title)
        task['class'] = topic
    print "add one news"
    db[NEWS_DB_COLLECTION].replace_one({'digest': task['digest']}, task, upsert=True)

while True:
    if cloudAMQP_client is not None:
        msg = cloudAMQP_client.getMessage()
        if msg is not None:
            # Parse and process the task
            try:
                handle_messages(msg)
            except Exception as e:
                print e
                pass

        cloudAMQP_client.sleep(SLEEP_TIME_IN_SECONDS)