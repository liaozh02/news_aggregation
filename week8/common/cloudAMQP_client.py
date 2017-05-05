import json
import pika
import traceback

class CloudAMQPClient:
    def __init__(self, cloud_amqp_url, queue_name):
        self.cloud_amqp_url = cloud_amqp_url
        self.queue_name = queue_name
        self.params = pika.URLParameters(cloud_amqp_url)
        self.params.socket_timeout = 3
        self.connection = pika.BlockingConnection(self.params)
        self.channel = self.connection.channel()
        self.channel.queue_declare(queue=queue_name)

    #send a message
    def sendMessage(self, message):
        self.channel.basic_publish(exchange="", routing_key=self.queue_name,
                                   body=json.dumps(message))
        print "[X] Sent message to %s: %s" % (self.queue_name, message)

    def getMessage(self):
        method_frame, header_frame, body = self.channel.basic_get(self.queue_name)
        if method_frame is not None:
            body = json.loads(body)
            print "[O] Got message from %s: %s" % (self.queue_name, body)
            self.channel.basic_ack(method_frame.delivery_tag)
            return body
        else:
            print "%s No message returned" % traceback.extract_stack()[0][0]
            return None

    def sleep(self, second):
        self.connection.sleep(second)

    def close(self):
        self.connection.close()
