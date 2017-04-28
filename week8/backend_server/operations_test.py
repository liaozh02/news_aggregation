import operations
from sets import Set
import sys
import os
import json
# import common package in parent directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'common')))
CONFIG_FILE = os.path.join(os.path.dirname(__file__), '..', 'config', 'config.json')

import mongodb_client
from cloudAMQP_client import CloudAMQPClient

with open(CONFIG_FILE, 'r') as f:
    data = json.load(f)
    CLICKS_DB_COLLECTION = data['mongoDb']['clicksMongoDbCollection']
    LOG_CLICKS_TASK_QUEUE_URL = data['queue']['logClicksTaskQueueUrl']
    LOG_CLICKS_TASK_QUEUE_NAME = data['queue']['logClicksTaskQueueName']

CloudAMQPClient = CloudAMQPClient(LOG_CLICKS_TASK_QUEUE_URL, LOG_CLICKS_TASK_QUEUE_NAME)

def test_getNewssummaryForuser():
    news_page_1 = operations.getNewssummaryForuser('test', 1)
    news_page_2 = operations.getNewssummaryForuser('test', 2)

    assert len(news_page_1) > 0
    assert len(news_page_2) > 0

    digest_page_1 = Set([news['digest'] for news in news_page_1])
    digest_page_2 = Set([news['digest'] for news in news_page_2])

    assert len(digest_page_1.intersection(digest_page_2))== 0

    print "test_getNewssummaryForuser passed!"

def test_logNewsclickForuser():
    db = mongodb_client.get_db()
    db[CLICKS_DB_COLLECTION].delete_many({"userId": "test"})

    operations.logNewsclickForuser('test', 'test_news')
    
    record = list(db[CLICKS_DB_COLLECTION].find().sort([('timestamp', -1)]).limit(1))[0]
    assert record is not None
    assert record['userId'] == 'test'
    assert record['newsId'] == 'test_news'
    assert record['timestamp'] is not None
    
    db[CLICKS_DB_COLLECTION].delete_many({'userId': 'test'})

    msg = CloudAMQPClient.getMessage()
    assert msg is not None
    assert msg['userId'] == 'test'
    assert msg['newsId'] == 'test_news'
    assert msg['timestamp'] is not None

    print "test_logNewsclickForuser passed!"

if __name__ == "__main__":
    test_getNewssummaryForuser()
    test_logNewsclickForuser()