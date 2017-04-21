import pyjsonrpc

http_client = pyjsonrpc.HttpClient(
    url = "http://localhost:6060"
)

def classify(text):
    topic = http_client.call('classify', text)
    print "class %s" % str(topic)
    return topic