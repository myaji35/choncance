"""SQLAlchemy ORM 모델 (Prisma 스키마와 동기화)"""
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Boolean, Numeric, Text,
    DateTime, JSON, Index
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class RawCrawlResult(Base):
    """원시 크롤링 데이터 테이블"""
    __tablename__ = "raw_crawl_results"

    id = Column(String, primary_key=True)
    source = Column(String(20), nullable=False, index=True)
    source_id = Column("sourceId", String(200))
    name = Column(String(300), nullable=False)
    address = Column(Text)
    phone = Column(String(30))
    lat = Column(Numeric(10, 7))
    lng = Column(Numeric(10, 7))
    source_rating = Column("sourceRating", Numeric(3, 2))
    review_count = Column("reviewCount", Integer, default=0)
    raw_reviews = Column("rawReviews", JSONB)
    amenities = Column(ARRAY(String), default=[])
    extra_data = Column("extraData", JSONB)
    crawled_at = Column("crawledAt", DateTime, default=datetime.utcnow)
    is_processed = Column("isProcessed", Boolean, default=False, index=True)

    __table_args__ = (
        Index("raw_crawl_results_crawledAt_idx", "crawledAt"),
    )


class PropertyIntelligence(Base):
    """정규화 + 점수 통합 테이블"""
    __tablename__ = "property_intelligence"

    id = Column(String, primary_key=True)
    name = Column(String(300), nullable=False)
    address = Column(Text)
    region = Column(String(50), index=True)
    subregion = Column(String(50))
    lat = Column(Numeric(10, 7))
    lng = Column(Numeric(10, 7))
    phone = Column(String(30))

    avg_rating = Column("avgRating", Numeric(3, 2))
    total_reviews = Column("totalReviews", Integer)
    sentiment_score = Column("sentimentScore", Numeric(4, 3))
    theme_score = Column("themeScore", Numeric(4, 3))
    recency_score = Column("recencyScore", Numeric(4, 3))
    vintee_score = Column("vinteeScore", Numeric(3, 2))

    auto_tags = Column("autoTags", ARRAY(String), default=[])
    is_recruited = Column("isRecruited", Boolean, default=False, index=True)
    recruit_note = Column("recruitNote", Text)
    recruited_at = Column("recruitedAt", DateTime)

    naver_id = Column("naverId", String(200))
    kakao_id = Column("kakaoId", String(200))
    yanolja_id = Column("yanoljaId", String(200))
    yeogi_id = Column("yeogiId", String(200))
    airbnb_id = Column("airbnbId", String(200))

    thumbnail_url = Column("thumbnailUrl", Text)
    created_at = Column("createdAt", DateTime, default=datetime.utcnow)
    updated_at = Column("updatedAt", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("property_intelligence_vinteeScore_idx", "vinteeScore"),
    )


class CrawlJobLog(Base):
    """크롤링 작업 로그 테이블"""
    __tablename__ = "crawl_job_logs"

    id = Column(String, primary_key=True)
    source = Column(String(20), nullable=False, index=True)
    region = Column(String(50))
    status = Column(String(20), nullable=False, index=True)  # running|completed|failed|partial
    total_crawled = Column("totalCrawled", Integer, default=0)
    new_properties = Column("newProperties", Integer, default=0)
    updated_properties = Column("updatedProperties", Integer, default=0)
    error_count = Column("errorCount", Integer, default=0)
    error_details = Column("errorDetails", JSONB)
    started_at = Column("startedAt", DateTime, default=datetime.utcnow)
    completed_at = Column("completedAt", DateTime)
    duration_seconds = Column("durationSeconds", Integer)
