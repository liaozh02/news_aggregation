import json
import pyjsonrpc
import os
import sys
import operator


# import common package in parent directory
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'common'))
CONFIG_FILE = os.path.join(os.path.dirname(__file__), '..', 'config', 'config.json')

import mongodb_client
import news_classes

with open(CONFIG_FILE, 'r') as f:
    data = json.load(f)
    SERVER_HOST = data['server']['recommendationServerHost']
    SERVER_PORT = int(data['server']['recommendationServerPort'])
    PREFER_DB_COLLECTION = data['mongoDb']['preferMongoDbCollection']

# Ref: http://stackoverflow.com/questions/5595425/what-is-the-best-way-to-compare-floats-for-almost-equality-in-python
def isclose(a, b, rel_tol=1e-09, abs_tol=0.0):
    return abs(a-b) <= max(rel_tol * max(abs(a), abs(b)), abs_tol)

class RequestHandler(pyjsonrpc.HttpRequestHandler):
    """ Test method """

    @pyjsonrpc.rpcmethod
    def getPreferenceForuser(self, userId):
        db = mongodb_client.get_db()
        model = db[PREFER_DB_COLLECTION].find_one({'userId': userId})
        if model is None:
            return []

        sorted_tuple = sorted(model['preference'].items(), key=operator.itemgetter(1), reverse=True)
        sorted_pref_list = [news_classes.prefers[x[0]] for x in sorted_tuple]
        sorted_value_list = [x[1] for x in sorted_tuple]

        if isclose(sorted_value_list[0], sorted_value_list[-1]):
            return []
        
        print sorted_pref_list
        return sorted_pref_list
        

http_server = pyjsonrpc.ThreadingHttpServer(
    server_address = (SERVER_HOST, SERVER_PORT),
    RequestHandlerClass = RequestHandler
)

print "Starting HTTP server on %s:%d" % (SERVER_HOST, SERVER_PORT)

http_server.serve_forever()