import news_topic_modeling_service_client as client

def test_basic():
    newsTitle = "Syria chemical attack 'fabricated' - Assad"
    topic = client.classify(newsTitle)
    assert topic == "World"
    print 'test_basic passed!'

if __name__ == "__main__":
    test_basic()