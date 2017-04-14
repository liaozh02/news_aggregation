# -*- coding:utf-8 -*-

import os
import sys

# import common package in parent directory
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'common'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'scrapers'))

from newspaper import Article
import cnn_news_scraper
from cloudAMQP_client import CloudAMQPClient


SCRAPE_NEWS_TASK_QUEUE_URL = "amqp://pwutupuw:X_8f-1LO72Y5bBGSmCQGv48ne3rxPR8f@donkey.rmq.cloudamqp.com/pwutupuw"
SCRAPE_NEWS_TASK_QUEUE_NAME = "tap-news-scrape-news-task-queue"
DEDUPE_NEWS_TASK_QUEUE_URL = "amqp://vxtrpsbc:R-25yfn8yeoXrWNZavBgTdMY9ZPhohXJ@donkey.rmq.cloudamqp.com/vxtrpsbc"
DEDUPE_NEWS_TASK_QUEUE_NAME = "tap-news-dedupe-news-task-queue"

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
