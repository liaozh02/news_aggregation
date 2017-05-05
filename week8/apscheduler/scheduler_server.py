#!/usr/bin/python -u
from apscheduler.schedulers.background import BackgroundScheduler
import logging
import newspipeline
import json
import pyjsonrpc
import sys
import os

CONFIG_FILE = os.path.join(os.path.dirname(__file__), '..', 'config', 'config.json')

class RequestHandler(pyjsonrpc.HttpRequestHandler):
    @pyjsonrpc.rpcmethod
    def addJob(self, func, *args, **kwargs):
        print "scheuler add job %s" % func
        scheduler.add_job(func, *args, **kwargs)

    @pyjsonrpc.rpcmethod
    def removeJob(self, job_id):
        print "scheduler remove job %s" % job_id
        scheduler.remove_job(job_id)

    @pyjsonrpc.rpcmethod
    def printJobs(self, jobstore=None):
        print "scheduler print jobs"
        scheduler.print_jobs(jobstore)

with open(CONFIG_FILE, 'r') as f:
    data = json.load(f)
    SERVER_HOST = data['server']['schedulerServiceHost']
    SERVER_PORT = int(data['server']['schedulerServicePort'])

logging.basicConfig()
scheduler = BackgroundScheduler()
scheduler.start()
http_server = pyjsonrpc.ThreadingHttpServer(
    server_address = (SERVER_HOST, SERVER_PORT),
    RequestHandlerClass = RequestHandler
)

print "Starting scheduler server on %s:%d" % (SERVER_HOST, SERVER_PORT)
http_server.serve_forever()


