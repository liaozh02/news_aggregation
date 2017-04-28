# -*- coding:utf-8 -*-
import json
import os
import sys

# import common package in parent directory
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'common'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'scrapers'))
CONFIG_FILE = os.path.join(os.path.dirname(__file__), '..', 'config', 'config.json')

from newspaper import Article
import cnn_news_scraper
from cloudAMQP_client import CloudAMQPClient

with open(CONFIG_FILE, 'r') as f:
    data = json.load(f)
    DEDUPE_NEWS_TASK_QUEUE_URL = data['queue']['dedupeNewsTaskQueueUrl']
    DEDUPE_NEWS_TASK_QUEUE_NAME = data['queue']['dedupeNewsTaskQueueName']
    SCRAPE_NEWS_TASK_QUEUE_URL = data['queue']['scrapeNewsTaskQueueUrl']
    SCRAPE_NEWS_TASK_QUEUE_NAME = data['queue']['scrapeNewsTaskQueueName']
    SLEEP_TIME_IN_SECONDS = int(data['queue']['fetchNewsTaskSleepTime'])

dedupe_news_queue_client = CloudAMQPClient(DEDUPE_NEWS_TASK_QUEUE_URL, DEDUPE_NEWS_TASK_QUEUE_NAME)
scrape_news_queue_client = CloudAMQPClient(SCRAPE_NEWS_TASK_QUEUE_URL, SCRAPE_NEWS_TASK_QUEUE_NAME)

def handle_message(msg):
    if msg is None or not isinstance(msg, dict):
        print "message is broken"
        return
    
    task = msg

    article = Article(task['url'])
    article.download()
    article.parse()

    print article.text

    task['text'] = article.text;
    dedupe_news_queue_client.sendMessage(task)


while True:
    #fetch msg from queue
    if scrape_news_queue_client is not None:
        msg = scrape_news_queue_client.getMessage()
        if msg is not None:
            #handle message
            try:
                handle_message(msg)
            except Exception as e:
                print e
                pass
        
        scrape_news_queue_client.sleep(SLEEP_TIME_IN_SECONDS)
