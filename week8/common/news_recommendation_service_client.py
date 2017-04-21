import pyjsonrpc

http_client = pyjsonrpc.HttpClient(
    url = "http://localhost:5050"
)

def getPreferenceForuser(userId):
    preference = http_client.call('getPreferenceForuser', userId)
    print "preference list %s" % str(preference)
    return preference