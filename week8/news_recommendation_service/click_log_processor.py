import news_classes
import json
import sys
import os
# import common package in parent directory
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'common'))

import mongodb_client
from cloudAMQP_client import CloudAMQPClient

with open('../config/config.json', 'r') as f:
    data = json.load(f)
    LOG_CLICKS_TASK_QUEUE_URL = data['queue']['logClicksTaskQueueUrl']
    LOG_CLICKS_TASK_QUEUE_NAME = data['queue']['logClicksTaskQueueName']
    SLEEP_TIME_IN_SECONDS = int(data['queue']['logClicksTaskSleepTime'])
    NEWS_DB_COLLECTION = data['mongoDb']['newsMongoDbCollection']
    PREFER_DB_COLLECTION = data['mongoDb']['preferMongoDbCollection']
    NUM_OF_CLASSES = int(data['classification']['classNums'])
    INITIAL_P = 1.0 /NUM_OF_CLASSES
    ALPHA = float(data['clicksModel']['alpha'])

logclick_client = CloudAMQPClient(LOG_CLICKS_TASK_QUEUE_URL, LOG_CLICKS_TASK_QUEUE_NAME)


def handle_message(msg):
    print msg
    if msg is None or not isinstance(msg, dict):
        return
    
    if ('userId' not in msg
        or 'newsId' not in msg
        or 'timestamp' not in msg):
        return

    userId = msg['userId']
    newsId = msg['newsId']
    print "userId: %s  newsId: %s" % (userId, newsId)

    db = mongodb_client.get_db()
    model = db[PREFER_DB_COLLECTION].find_one({'userId': userId})

    if model is None:
        print 'Creating preference model for new user %s' % userId
        new_model = {'userId': userId}
        preference = {}
        for i in news_classes.classes:
            topic = news_classes.classes[i]      
            preference[topic] = float(INITIAL_P)
        new_model['preference'] = preference
        model = new_model

    print 'Update preference model for user %s' % userId
    news = db[NEWS_DB_COLLECTION].find_one({'digest':newsId})

    if (news is None
        or 'class' not in news
        or news['class'] not in news_classes.classes):
        print 'skipping processing'
        return

    click_class = news_classes.classes[news['class']]
    print "update preference for %s" % click_class

    old_p = model['preference'][click_class]
    new_p = float((1 - ALPHA) * old_p + ALPHA)
    model['preference'][click_class] = new_p

    for i,prob in model['preference'].iteritems():
        if not i == click_class:
            model['preference'][i] = float((1 - ALPHA) * model['preference'][i])
    print model['preference']

    db[PREFER_DB_COLLECTION].replace_one({'userId': userId}, model, upsert=True)

def run():
    while True:
        #fetch msg from queue
        if logclick_client is not None:
            msg = logclick_client.getMessage()
            if msg is not None:
                #handle message
                try:
                    handle_message(msg)
                except Exception as e:
                    print e
                    pass
        logclick_client.sleep(SLEEP_TIME_IN_SECONDS)

if  __name__ == "__main__":
    run()