from datetime import datetime
import json
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'news_pipeline'))

from news_monitor import NewsMonitor
from news_fetcher import NewsFetcher
from news_deduper import NewsDeduper

news_monitor_instance = NewsMonitor()
news_fetcher_instance = NewsFetcher()
news_deduper_instance = NewsDeduper()

def newsMonitor():
    print 'newsMonitor start: %s' % datetime.now()
    news_monitor_instance()
    print 'newsMonitor finish: %s' % datetime.now()

def newsFetcher():
    print 'newsFetcher start: %s' % datetime.now()
    news_fetcher_instance()
    print 'newsFetcher finish: %s' % datetime.now()
    
def newsDeduper():
    print 'newsDeduper start: %s' % datetime.now()
    news_deduper_instance()
    print 'newsDeduper finish: %s' % datetime.now()