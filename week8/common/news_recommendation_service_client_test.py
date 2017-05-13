import news_recommendation_service_client as client

def test_basic():
    userId = "liaozh02@gmail.com"
    pref = client.getPreferenceForuser(userId)
    print pref
    assert pref is not None
    print 'test_basic passed!'

if __name__ == "__main__":
    test_basic()