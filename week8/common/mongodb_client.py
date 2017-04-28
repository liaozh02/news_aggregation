from pymongo import MongoClient
import json
import os

CONFIG_FILE = os.path.join(os.path.dirname(__file__), '..', 'config', 'config.json')

with open(CONFIG_FILE, 'r') as f:
    data = json.load(f)
    MONGODB_HOST = data['mongoDb']['newsMongoDbHost']
    MONGODB_PORT = int(data['mongoDb']['newsMongoDbPort'])
    DB_NAME = data['mongoDb']['newsMongoDbName']

client = MongoClient("%s:%d" % (MONGODB_HOST, MONGODB_PORT))

def get_db(db=DB_NAME):
    db = client[db]
    return db