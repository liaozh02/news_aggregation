import json
import os
import requests
import sys

CONFIG_FILE = os.path.join(os.path.dirname(__file__), '..', 'config', 'config.json')

with open(CONFIG_FILE, 'r') as f:
    data = json.load(f)
    NEWS_API_EP = data['newsApi']['ep']
    NEWS_API_KEY = data['newsApi']['key']
    DEFAULT_API = data['newsApi']['apiDefault']
    DEFAULT_SORT = data['newsApi']['sortDefault']
    DEFAULT_SOURCES = data['newsApi']['sourceDefault']

def buildUrl(end_point=NEWS_API_EP, api_name=DEFAULT_API):
    return end_point + api_name

def getNewsFromSource(sources=DEFAULT_SOURCES, sortBy=DEFAULT_SORT):
    articles = []
    for source in sources:
        payload = {'apiKey': NEWS_API_KEY,
                   'source': source,
                   'sortBy': sortBy}
        response = requests.get(buildUrl(), params=payload, verify=False)
        res_json = json.loads(response.content)

        if (res_json is not None and
            res_json['status'] == 'ok' and
            res_json['source'] is not None):

            for news in res_json['articles']:
                news['source'] = res_json['source']

            articles.extend(res_json['articles'])
    
    return articles