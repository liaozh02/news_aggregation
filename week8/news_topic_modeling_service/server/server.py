import json
import pyjsonrpc
import os
import sys
import pickle
import pandas as pd
import numpy as np
import tensorflow as tf
import news_classes
import time

learn = tf.contrib.learn
from tensorflow.contrib.learn.python.learn.estimators import model_fn
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'trainer'))
import news_cnn_model
N_CLASSES = 17
MODEL_UPDATE_LAG_IN_SECONDS = 10

SERVER_HOST = 'localhost'
SERVER_PORT = 6060

VARS_FILE = "../model/vars"
VOCAB_PROCESSOR_SAVE_FILE = '../model/vocab_procesor_save_file'
MODEL_DIR = '../model'

def restoreVars():
    with open(VARS_FILE, 'r') as f:
        global n_words
        n_words = pickle.load(f)

    global vocab_processor
    vocab_processor = learn.preprocessing.VocabularyProcessor.restore(VOCAB_PROCESSOR_SAVE_FILE)
    print vocab_processor
    print 'Var updated'

def loadModel():
    global classifier
    classifier = learn.Estimator(
        model_fn=news_cnn_model.generate_cnn_model(N_CLASSES, n_words),
        model_dir=MODEL_DIR
    )
    df = pd.read_csv('../trainer/tap-news-test.csv', header=None)

    train_df = df[0:1]
    x_train = train_df[1]
    x_train = np.array(list(vocab_processor.transform(x_train)), dtype=int)
    y_train = np.array(train_df[0], dtype=int)
    classifier.evaluate(x_train, y_train)

    print 'Model updated'

restoreVars()
loadModel()

print 'Model loaded'

class ReloadModuleHandler(FileSystemEventHandler):
    def on_any_event(self, event):
        print 'Model upadate detected,loading new model'
        time.sleep(MODEL_UPDATE_LAG_IN_SECONDS)
        restoreVars()
        loadModel()

class RequestHandler(pyjsonrpc.HttpRequestHandler):
    """ Test method """
    @pyjsonrpc.rpcmethod
    def classify(self,text):
        print text
        text_series = pd.Series([text])
        predict_x = np.array(list(vocab_processor.transform(text_series)))
        print predict_x

        y_predicted = [
            p['class'] for p in classifier.predict(
                predict_x, as_iterable=True
            )
        ]
        print y_predicted[0]
        topic = news_classes.class_map[str(y_predicted[0])]
        return topic

#setup watchdog
observer = Observer()
observer.schedule(ReloadModuleHandler, path=MODEL_DIR, recursive=False)
observer.start()

http_server = pyjsonrpc.ThreadingHttpServer(
    server_address = (SERVER_HOST, SERVER_PORT),
    RequestHandlerClass = RequestHandler
)

print "Starting HTTP server on %s:%d" % (SERVER_HOST, SERVER_PORT)

http_server.serve_forever()