import cnn_news_scraper as scraper

EXPECTED_STRING = "the first US strike against the Syrian government in the country's six-year civil war."
CNN_NEWS_URL = "http://www.cnn.com/2017/04/13/politics/donald-trump-moab-afghanistan/index.html"

def test_basic():
    news = scraper.extract_news(CNN_NEWS_URL)

    assert EXPECTED_STRING in news
    print 'test_basic passed!'

if __name__ ==  "__main__":
    test_basic()