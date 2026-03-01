from .base import BaseCrawler, RawProperty
from .naver import NaverCrawler
from .kakao import KakaoCrawler
from .yanolja import YanoljaCrawler
from .yeogi import YeogiCrawler
from .airbnb import AirbnbCrawler
from .blog import BlogCrawler

# 소스명 → 크롤러 클래스 매핑
CRAWLER_REGISTRY: dict[str, type[BaseCrawler]] = {
    "naver":   NaverCrawler,
    "kakao":   KakaoCrawler,
    "yanolja": YanoljaCrawler,
    "yeogi":   YeogiCrawler,
    "airbnb":  AirbnbCrawler,
    "blog":    BlogCrawler,
}

__all__ = [
    "BaseCrawler", "RawProperty",
    "NaverCrawler", "KakaoCrawler", "YanoljaCrawler",
    "YeogiCrawler", "AirbnbCrawler", "BlogCrawler",
    "CRAWLER_REGISTRY",
]
