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
    NUM_OF_CLASSES = int(data['classification']['classNums'])
    INITIAL_P = 1.0 /NUM_OF_CLASSES
    ALPHA = float(data['clicksModel']['alpha'])

# Ref: http://stackoverflow.com/questions/5595425/what-is-the-best-way-to-compare-floats-for-almost-equality-in-python
#def isclose(a, b, rel_tol=1e-09, abs_tol=0.0):
#    return abs(a-b) <= max(rel_tol * max(abs(a), abs(b)), abs_tol)

class RequestHandler(pyjsonrpc.HttpRequestHandler):
    """ Test method """

    @pyjsonrpc.rpcmethod
    def getPreferenceForuser(self, userId):
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
            db[PREFER_DB_COLLECTION].replace_one({'userId': userId}, model, upsert=True)

        pref_dict_db = dict(model['preference'])
        pref_list = [news_classes.prefers[k] for k in pref_dict_db]
        value_list = [pref_dict_db[k] for k in pref_dict_db]
        pref_dict = dict(zip(pref_list, value_list))
        return pref_dict
        '''
        sorted_tuple = sorted(model['preference'].items(), key=operator.itemgetter(1), reverse=True)
        sorted_pref_list = [news_classes.prefers[x[0]] for x in sorted_tuple]
        sorted_value_list = [x[1] for x in sorted_tuple]

        if isclose(sorted_value_list[0], sorted_value_list[-1]):
            return []
        
        print sorted_pref_list
        return sorted_pref_list
        '''

http_server = pyjsonrpc.ThreadingHttpServer(
    server_address = (SERVER_HOST, SERVER_PORT),
    RequestHandlerClass = RequestHandler
)

print "Starting HTTP server on %s:%d" % (SERVER_HOST, SERVER_PORT)

http_server.serve_forever()