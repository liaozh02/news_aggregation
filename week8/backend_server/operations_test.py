import operations
from sets import Set

def test_getNewssummaryForuser():
    news_page_1 = operations.getNewssummaryForuser('test', 1)
    news_page_2 = operations.getNewssummaryForuser('test', 2)

    assert len(news_page_1) > 0
    assert len(news_page_2) > 0

    digest_page_1 = Set([news['digest'] for news in news_page_1])
    digest_page_2 = Set([news['digest'] for news in news_page_2])

    assert len(digest_page_1.intersection(digest_page_2))== 0

    print "test_getNewssummaryForuser passed!"

if __name__ == "__main__":
    test_getNewssummaryForuser()