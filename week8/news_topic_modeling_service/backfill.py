import os
import sys

# import common package in parent directory
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'common'))

import mongodb_client
import news_topic_modeling_service_client
from news_classify_by_rules import NewsClassifyByRules
classifier = NewsClassifyByRules()

if __name__ == '__main__':
    db = mongodb_client.get_db()
    cursor = db['news'].find({})
    count = 0
    count_rules = 0
    for news in cursor:
        count += 1
        print count
#       if 'class' not in news:
        print 'Populating classes...'
        if 'title' in news:
            title = news['title'].encode("ascii", 'ignore')
            print title
            if 'url' in news and 'source' in news: 
                url = news['url'].encode("ascii")
                source = news['source'].encode('ascii')
                topic = classifier.classify(source, url)
                if topic is None:
                    topic = news_topic_modeling_service_client.classify(title)
                else:
                    count_rules += 1
                
            else:
                topic = news_topic_modeling_service_client.classify(title)
                
            news['class'] = topic
            news['version'] = "1"
            print topic
        db['news'].replace_one({'digest': news['digest']}, news, upsert=True)
    
    print "Totol count %d with %d could by classified by url" % (count, count_rules)