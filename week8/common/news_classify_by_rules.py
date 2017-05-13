import json
import re
import os

CONFIG_FILE = os.path.join(os.path.dirname(__file__), '..', 'config', 'news_classify_rules.json')

class NewsClassifyByRules:
    def __init__(self):
        with open(CONFIG_FILE, 'r') as f:
            self.regMatchLists = json.load(f)

    def classify(self, source, url):
        if source in self.regMatchLists:
            print source
            regMatchList = self.regMatchLists[source]
            for regMatch in regMatchList:
                if re.search(regMatch['pattern'], url) is not None:
                    return regMatch['class']

        return None