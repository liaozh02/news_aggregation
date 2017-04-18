import requests
import os
import random

from lxml import html
USER_AGENTS_FILE = os.path.join(os.path.dirname(__file__), 'user_agents.txt')
USER_AGENTS = []

GET_CNN_NEWS_XPATH = '''//p[@class="zn-body__paragraph"]//text() | //div[@class="zn-body__paragraph"]//text()'''
with open(USER_AGENTS_FILE, 'r') as uaf:
    for ua in uaf.readlines():
        if ua:
            USER_AGENTS.append(ua.strip()[1:-1])

random.shuffle(USER_AGENTS)


def getHeaders():
    ua = random.choice(USER_AGENTS)
    headers = {
        'Connection': 'close',
        'User-Agent': ua
    }
    return headers
def extract_news(news_url):
    #Fetch html
    session_requests = requests.session()
    response = session_requests.get(news_url, headers=getHeaders())

    news = {}

    #Parse html
    try:
        tree = html.fromstring(response.content)
        #Extract info
        news = tree.xpath(GET_CNN_NEWS_XPATH)
        news = ''.join(news)
    except Exception as e:
        print  # coding=utf-8
        return {}
    
    return news