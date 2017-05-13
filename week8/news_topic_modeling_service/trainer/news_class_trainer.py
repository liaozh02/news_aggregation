import news_cnn_model
import numpy as np
import os
import pandas as pd
import pickle
import shutil
import tensorflow as tf
#from nltk.corpus import stopwords
#from nltk.tokenize import  RegexpTokenizer
#from nltk.stem import *


from sklearn import metrics

learn = tf.contrib.learn
from tensorflow.contrib.learn.python.learn.estimators import estimator
REMOVE_PREVIOUS_MODEL = True

MODEL_OUTPUT_DIR = '../model/'
DATA_SET_FILE = './tap-news.csv'
VARS_FILE = '../model/vars'
VOCAB_PROCESSOR_SAVE_FILE = '../model/vocab_procesor_save_file'
#parameter for title training
MAX_DOCUMENT_LENGTH = 20
STEPS = 215
BATCH = 128
#parameter for test training
#MAX_DOCUMENT_LENGTH = 60
#STEPS = 250
#BATCH = 128

N_CLASSES = 8


tf.logging.set_verbosity(tf.logging.INFO)
def main(unused_argv):
    if REMOVE_PREVIOUS_MODEL:
        # Remove old model
        shutil.rmtree(MODEL_OUTPUT_DIR)
        os.mkdir(MODEL_OUTPUT_DIR)

    # Prepare training and testing data
    df = pd.read_csv(DATA_SET_FILE, header=None)
    train_df = df[0:3300]
    test_df = df.drop(train_df.index)

    # x - news title, y - class
    x_train = train_df[1]
    x_train = x_train.str.replace('[^\x00-\x7F]','')


    #####################################
    '''
    x_train = train_df[2]
    x_train = x_train.str.replace('[^\x00-\x7F]','')
    tokenizer =  RegexpTokenizer(r"\w+")
    stemmer = PorterStemmer()
    #wnl = WordNetLemmatizer()

    for i in xrange(0,3000):
        x_train[i] = str(x_train[i])
        x_train[i] = tokenizer.tokenize(x_train[i])
        x_train[i] = list(word for word in x_train[i] if word not in stopwords.words('english'))
        x_train[i] = [stemmer.stem(word) for word in x_train[i]]
        #x_train[i] = [wnl.lemmatize(word) for word in x_train[i]]
        x_train[i] = " ".join(str(word) for word in x_train[i])
    '''
    ###########################################################
    
    y_train = np.array(train_df[0], dtype=int)
    x_test = test_df[1]
    y_test = np.array(test_df[0], dtype=int)


    # Process vocabulary
    vocab_processor = learn.preprocessing.VocabularyProcessor(MAX_DOCUMENT_LENGTH)
    x_train = np.array(list(vocab_processor.fit_transform(x_train)))
    x_test = np.array(list(vocab_processor.transform(x_test)))

    n_words = len(vocab_processor.vocabulary_)
    print('Total words: %d' % n_words)


    # Saving n_words and vocab_processor:
    with open(VARS_FILE, 'w') as f:
        pickle.dump(n_words, f)
    vocab_processor.save(VOCAB_PROCESSOR_SAVE_FILE)

    # Build model
    classifier = estimator.SKCompat(estimator.Estimator(
        model_fn=news_cnn_model.generate_cnn_model(N_CLASSES, n_words),
        model_dir=MODEL_OUTPUT_DIR,
        config=learn.RunConfig(save_checkpoints_secs=10, save_summary_steps=10)))
    # Set up logging for predictions
    tensors_to_log = {"prob": "softmax_tensor"}
    logging_hook = tf.train.LoggingTensorHook(
        tensors=tensors_to_log, every_n_iter=100)

    # Train and predict
    classifier.fit(x_train, y_train, batch_size=BATCH, steps=STEPS, monitors=[logging_hook])

    # Configure the accuracy metric
    metrics = {
        "accuracy":
        learn.MetricSpec(
            metric_fn=tf.metrics.accuracy, prediction_key="class")
    }

    # Evaluate the model
    eval_results = classifier.score(x=x_test, y=y_test, metrics=metrics)

if __name__ == '__main__':
    tf.app.run(main=main)
