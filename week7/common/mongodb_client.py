from pymongo import MongoClient

MONGODB_HOST = "localhost"
MONGODB_PORT = 27017
DB_NAME = "tap-news-test"

client = MongoClient("%s:%d" % (MONGODB_HOST, MONGODB_PORT))

def get_db(db=DB_NAME):
    db = client[db]
    return db