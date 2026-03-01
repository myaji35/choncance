"""
크롤러 설정 모듈
환경 변수 기반 설정 관리
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Database
DATABASE_URL = os.environ["DATABASE_URL"]

# Anthropic
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

# 크롤링 속도 제한 (법적 안전장치)
CRAWL_CONFIG = {
    "delay_min": float(os.getenv("CRAWL_DELAY_MIN", "3")),
    "delay_max": float(os.getenv("CRAWL_DELAY_MAX", "5")),
    "max_requests_per_hour": int(os.getenv("CRAWL_MAX_REQUESTS_PER_HOUR", "300")),
    "respect_robots_txt": True,
    "store_source": True,
    "internal_only": True,
    "data_usage": "internal_analysis_only",
}

# 스케줄 설정
SCHEDULE_CONFIG = {
    "full_crawl": os.getenv("CRAWL_SCHEDULE_FULL", "0 2 * * 0"),        # 매주 일요일 02:00
    "incremental": os.getenv("CRAWL_SCHEDULE_INCREMENTAL", "0 3 * * *"), # 매일 03:00
}

# 로깅
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# 전국 17개 시도 크롤링 대상
TARGET_REGIONS = [
    "강원도", "경기도", "경상남도", "경상북도", "광주광역시",
    "대구광역시", "대전광역시", "부산광역시", "서울특별시", "세종특별자치시",
    "울산광역시", "인천광역시", "전라남도", "전라북도", "제주특별자치도",
    "충청남도", "충청북도",
]

# 플랫폼 가중치 (VINTEE Score avg_rating 계산용)
PLATFORM_WEIGHTS = {
    "airbnb":  0.30,
    "yeogi":   0.25,
    "yanolja": 0.20,
    "naver":   0.15,
    "kakao":   0.10,
}
