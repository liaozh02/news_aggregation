import json
import pyjsonrpc
import os
import sys
import operations


# import common package in parent directory
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'common'))

SERVER_HOST = 'localhost'
SERVER_PORT = 4040

class RequestHandler(pyjsonrpc.HttpRequestHandler):
    """ Test method """
    @pyjsonrpc.rpcmethod
    def add(self, a, b):
        print "add is called with %d and %d" % (a, b)
        return a + b

    @pyjsonrpc.rpcmethod
    def getNewssummaryForuser(self, userId, pageNum):
        return operations.getNewssummaryForuser(userId, pageNum)

    @pyjsonrpc.rpcmethod
    def logNewsclickForuser(self, userId, newsId):
        return operations.logNewsclickForuser(userId, newsId)

http_server = pyjsonrpc.ThreadingHttpServer(
    server_address = (SERVER_HOST, SERVER_PORT),
    RequestHandlerClass = RequestHandler
)

print "Starting HTTP server on %s:%d" % (SERVER_HOST, SERVER_PORT)

http_server.serve_forever()