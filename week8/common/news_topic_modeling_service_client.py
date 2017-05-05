import json
import os
import pyjsonrpc
import sys

CONFIG_FILE = os.path.join(os.path.dirname(__file__), '..', 'config', 'config.json')

with open(CONFIG_FILE, 'r') as f:
    data = json.load(f)
    host = data['server']['modelServerHost']
    port = data['server']['modelServerPort']

url = "http://" + host + ":" + port
print url
http_client = pyjsonrpc.HttpClient(url)

def classify(text):
    topic = http_client.call('classify', text)
    print "class %s" % str(topic)
    return topic