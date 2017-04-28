import news_classes
import json
import sys
import os
from datetime import datetime 
import click_log_processor
# import common package in parent directory
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'common'))
CONFIG_FILE = os.path.join(os.path.dirname(__file__), '..', 'config', 'config.json')

import mongodb_client

with open(CONFIG_FILE, 'r') as f:
    data = json.load(f)
    PREFER_DB_COLLECTION = data['mongoDb']['preferMongoDbCollection']
    NUM_OF_CLASSES = int(data['classification']['classNums'])

def pre_process():
    db = mongodb_client.get_db()
    news_test = {'digest': 'test_news',
                 'class': 'World'}
    db[NEWS_DB_COLLECTION].insert(news_test)

def test_basic():
    db = mongodb_client.get_db()
    db[PREFER_DB_COLLECTION].delete_many({'userId': 'test_user'})

    msg = {'userId': 'test_user',
           'newsId': 'test_news',
           'timestamp': str(datetime.utcnow())}
    click_log_processor.handle_message(msg)

    model = db[PREFER_DB_COLLECTION].find_one({'userId': 'test_user'})
    assert model is not None
    assert len(model['preference']) == NUM_OF_CLASSES

    print 'test_basic passed'

if __name__ == "__main__":
    #pre_process()
    test_basic()