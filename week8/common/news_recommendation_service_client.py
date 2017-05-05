import json
import os
import pyjsonrpc
import sys

CONFIG_FILE = os.path.join(os.path.dirname(__file__), '..', 'config', 'config.json')

with open(CONFIG_FILE, 'r') as f:
    data = json.load(f)
    host = data['server']['recommendationServerHost']
    port = data['server']['recommendationServerPort']

url = "http://" + host + ":" + port
print url
http_client = pyjsonrpc.HttpClient(url)

def getPreferenceForuser(userId):
    preference = http_client.call('getPreferenceForuser', userId)
    print "preference list %s" % str(preference)
    return preference