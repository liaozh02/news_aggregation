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

class NewsFetcher():
    def __init__(self):
        with open(CONFIG_FILE, 'r') as f:
            data = json.load(f)
            self.dedupe_news_task_queue_url = data['queue']['dedupeNewsTaskQueueUrl']
            self.dedupe_news_task_queue_name = data['queue']['dedupeNewsTaskQueueName']
            self.scrape_news_task_queue_url = data['queue']['scrapeNewsTaskQueueUrl']
            self.scrape_news_task_queue_name = data['queue']['scrapeNewsTaskQueueName']
            self.sleep_time_in_seconds = int(data['queue']['fetchNewsTaskSleepTime'])

    def handle_message(self, msg):
        if msg is None or not isinstance(msg, dict):
            print "message is broken"
            return
        
        task = msg
        article = Article(task['url'])
        article.download()
        article.parse()
  #      print article.text

        task['text'] = article.text;
        self.dedupe_news_queue_client.sendMessage(task)


    def __call__(self): 
        self.dedupe_news_queue_client = CloudAMQPClient(self.dedupe_news_task_queue_url, self.dedupe_news_task_queue_name)
        self.scrape_news_queue_client = CloudAMQPClient(self.scrape_news_task_queue_url, self.scrape_news_task_queue_name)

    #fetch msg from queue
        if self.scrape_news_queue_client is not None:
            while True:
                msg = self.scrape_news_queue_client.getMessage()
                if msg is not None:
                    #handle message
                    try:
                        self.handle_message(msg)
                    except Exception as e:
                        print e
                        pass
                    self.scrape_news_queue_client.sleep(self.sleep_time_in_seconds)
                else:
                    self.scrape_news_queue_client.close()
                    self.dedupe_news_queue_client.close()
                    break

if __name__ == "__main__":
    news_instance = NewsFetcher()
    news_instance()                

                