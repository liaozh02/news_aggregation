from news_classify_by_rules import NewsClassifyByRules

classifier = NewsClassifyByRules()
url = "http://money.cnn.com/2017/05/05/investing/trump-economy-report-card-jobs/index.html"
source = "cnn"
def test_basic():
    topic = classifier.classify(source, url)
    print topic
    assert topic == "Sports"
    print "test_basic passed"

if __name__ == "__main__":
    test_basic()
    
