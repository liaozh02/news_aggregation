import json
import os
import pyjsonrpc
import sys

CONFIG_FILE = os.path.join(os.path.dirname(__file__), '..', 'config', 'config.json')

with open(CONFIG_FILE, 'r') as f:
    data = json.load(f)
    host = data['server']['schedulerServiceHost']
    port = data['server']['schedulerServicePort']
    start_minute = int(data['scheduler']['newspipeline']['minutes'])

url = "http://" + host + ":" + port
print "connect to %s" % url
http_client = pyjsonrpc.HttpClient(url)

def scheduleNewsPipeLine():
    http_client.call('addJob', 'newspipeline:newsMonitor', 'cron', minute=str(start_minute), id="news_monitor")
    http_client.call('addJob', 'newspipeline:newsFetcher', 'cron', minute=str(start_minute + 1), id="news_fetcher")
    http_client.call('addJob', 'newspipeline:newsDeduper', 'cron', minute=str(start_minute + 5), id="news_deduper")
    print "start a background newspipeline scheduler at minute %d everyhour" % start_minute

def removeNewsPipeLine():
    http_client.call('removeJob', "news_monitor")
    http_client.call('removeJob', "news_fetcher")
    http_client.call('removeJob', "news_deduper")
    print "remove all newspipeline jobs"

def printJobs():
    http_client.call('printJobs')