import datetime
import news_classes
import json
import sys
import os
# import common package in parent directory
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'common'))

import mongodb_client
from cloudAMQP_client import CloudAMQPClient

class ClickLogProcessor:
    def __init__(self):
        with open('../config/config.json', 'r') as f:
            data = json.load(f)
            LOG_CLICKS_TASK_QUEUE_URL = data['queue']['logClicksTaskQueueUrl']
            LOG_CLICKS_TASK_QUEUE_NAME = data['queue']['logClicksTaskQueueName']
            self.sleep_time = int(data['queue']['logClicksTaskSleepTime'])
            self.news_db_collection = data['mongoDb']['newsMongoDbCollection']
            self.prefer_db_collection = data['mongoDb']['preferMongoDbCollection']
            self.alpha = float(data['clicksModel']['alpha'])
            self.daydelta = int(data['clicksModel']['daydelta'])
 
        self.logclick_client = CloudAMQPClient(LOG_CLICKS_TASK_QUEUE_URL, LOG_CLICKS_TASK_QUEUE_NAME)
        self.db = mongodb_client.get_db()
        self.cnt_list = {}
        self.clicks_list = {}
        for i in news_classes.classes:
            self.cnt_list[i] = 0

    def __call__(self):
        while True:
            #fetch msg from queue
            if self.logclick_client is not None:
                msg = self.logclick_client.getMessage()
                if msg is not None:
                    #handle message
                    try:
                        self.handle_message(msg)
                    except Exception as e:
                        print e
                        pass
                else:
                    break
            self.logclick_client.sleep(self.sleep_time)
        
        self.caculate_news_trend()
        self.update_prefer()
        

    def caculate_news_trend(self):
        now = datetime.datetime.utcnow()
        end_time = now
        start_time= end_time - datetime.timedelta(days=self.daydelta)
        print start_time
        print end_time

        news_list = list(self.db[self.news_db_collection].find({'publishedAt':{'$gte':start_time, '$lt': end_time}}))

        #caculate news_number in each catogry
        for news in news_list:
            if 'class' in news:
                self.cnt_list[news['class']]+=1
        print self.cnt_list
        for i in self.cnt_list:
            self.cnt_list[i] = float(self.cnt_list[i])/len(news_list)
        print self.cnt_list

    def update_prefer(self):
        for userId in self.clicks_list:
            model = self.db[self.prefer_db_collection].find_one({'userId': userId})

            if model is None:
                print "no user prefer info skip processing"
                return

            print 'Update preference model for user %s' % userId

            print self.clicks_list[userId]
            
            ratio_list = self.clicks_list[userId]
            sum = 0
            for topic in ratio_list:
                sum += ratio_list[topic]
            prob = 0
            #calulate bayesian probability
            for topic in ratio_list:
                ratio_list[topic] = float(ratio_list[topic])/sum
                ratio_list[topic] = float(ratio_list[topic])/float(self.cnt_list[topic])
                prob += ratio_list[topic]
            
            #normaliztion
            for topic in ratio_list:
                ratio_list[topic] = float(ratio_list[topic]/prob)

            print ratio_list

            print model['preference']
            for i,prob in model['preference'].iteritems():
                model['preference'][i] = (1 - self.alpha) * model['preference'][i] + self.alpha * ratio_list[news_classes.prefers[i]]
            
            print model['preference']

            self.db[self.prefer_db_collection].replace_one({'userId': userId}, model, upsert=True)

    def handle_message(self, msg):
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
        news = self.db[self.news_db_collection].find_one({'digest':newsId})
        if (news is None
            or 'class' not in news
            or news['class'] not in news_classes.classes):
            print 'skipping processing'
            return
        click_class = news['class']
        if userId not in self.clicks_list:
            self.clicks_list[userId] = {}     
            for i in news_classes.classes:
                self.clicks_list[userId][i] = 0

        self.clicks_list[userId][click_class] += 1


if  __name__ == "__main__":
    click_log_processor_instance = ClickLogProcessor()
    click_log_processor_instance()