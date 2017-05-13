import os
import sys
import pandas as pd
# import common package in parent directory
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'common'))

import news_topic_modeling_service_client
from news_classify_by_rules import NewsClassifyByRules
classifier = NewsClassifyByRules()
class_map = {
  'World': '1',
  'U.S.': '2',
  'Business & Economic': '3',
  'Technology': '4',
  'Entertainment': '5',
  'Sports': '6',
  'Science & Environment': '7',
  'Health & Life': '8'
}
if __name__ == '__main__':
    df = pd.read_csv("./news_complete.csv", header=None)
    train_df = df
    length = len(train_df.index)
    train_df[1] =  train_df[1].str.replace('[^\x00-\x7F]','')
    titles = list(train_df[1])
    classes = list(train_df[0])
    urls = list(train_df[3])
    sources = list(train_df[5])
    count = 0
    for i in xrange(0, length-1):
        print titles[i]
        print urls[i]
        print sources[i]
        topic = classifier.classify(sources[i], urls[i])
        if topic is not None:
            print "Get by url %s" % topic

        else:
            topic = news_topic_modeling_service_client.classify(titles[i]) 
            print "Get by ml %s" % topic   
            
        if str(classes[i]) == class_map[topic]:
            print "matched"
            count = count + 1
        else:
            print class_map[topic]
            print str(classes[i])

    print "right cnt %d" % count
    print "right ration %f" % (count/length)