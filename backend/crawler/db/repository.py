"""DB CRUD 레포지토리"""
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from db.models import RawCrawlResult, PropertyIntelligence, CrawlJobLog


class CrawlRepository:
    """크롤링 데이터 저장/조회"""

    def __init__(self, db: Session):
        self.db = db

    def save_raw(self, data: dict) -> RawCrawlResult:
        """원시 크롤링 데이터 저장"""
        record = RawCrawlResult(
            id=str(uuid.uuid4()),
            source=data["source"],
            source_id=data.get("source_id"),
            name=data["name"],
            address=data.get("address"),
            phone=data.get("phone"),
            lat=data.get("lat"),
            lng=data.get("lng"),
            source_rating=data.get("source_rating"),
            review_count=data.get("review_count", 0),
            raw_reviews=data.get("raw_reviews"),
            amenities=data.get("amenities", []),
            extra_data=data.get("extra_data"),
        )
        self.db.add(record)
        return record

    def get_unprocessed(self, limit: int = 100) -> list[RawCrawlResult]:
        """미처리 raw 데이터 조회"""
        return (
            self.db.query(RawCrawlResult)
            .filter(RawCrawlResult.is_processed == False)
            .limit(limit)
            .all()
        )

    def mark_processed(self, record_id: str):
        """처리 완료 표시"""
        self.db.query(RawCrawlResult).filter(
            RawCrawlResult.id == record_id
        ).update({"is_processed": True})

    def upsert_intelligence(self, data: dict) -> PropertyIntelligence:
        """PropertyIntelligence upsert (이름+지역으로 기존 레코드 탐색)"""
        existing = (
            self.db.query(PropertyIntelligence)
            .filter(
                PropertyIntelligence.name == data["name"],
                PropertyIntelligence.region == data.get("region"),
            )
            .first()
        )

        if existing:
            for key, val in data.items():
                if hasattr(existing, key) and val is not None:
                    setattr(existing, key, val)
            existing.updated_at = datetime.utcnow()
            return existing
        else:
            record = PropertyIntelligence(
                id=str(uuid.uuid4()),
                **{k: v for k, v in data.items() if hasattr(PropertyIntelligence, k)},
            )
            self.db.add(record)
            return record

    def count_by_source(self) -> dict:
        """소스별 수집 건수"""
        results = (
            self.db.query(RawCrawlResult.source, func.count().label("cnt"))
            .group_by(RawCrawlResult.source)
            .all()
        )
        return {r.source: r.cnt for r in results}


class JobLogRepository:
    """크롤링 작업 로그 저장/조회"""

    def __init__(self, db: Session):
        self.db = db

    def start_job(self, source: str, region: str = None) -> CrawlJobLog:
        job = CrawlJobLog(
            id=str(uuid.uuid4()),
            source=source,
            region=region,
            status="running",
        )
        self.db.add(job)
        self.db.flush()
        return job

    def complete_job(self, job_id: str, stats: dict):
        started = self.db.query(CrawlJobLog).filter(CrawlJobLog.id == job_id).first()
        if started:
            now = datetime.utcnow()
            duration = int((now - started.started_at).total_seconds())
            self.db.query(CrawlJobLog).filter(CrawlJobLog.id == job_id).update({
                "status": "completed" if stats.get("error_count", 0) == 0 else "partial",
                "total_crawled": stats.get("total_crawled", 0),
                "new_properties": stats.get("new_properties", 0),
                "updated_properties": stats.get("updated_properties", 0),
                "error_count": stats.get("error_count", 0),
                "error_details": stats.get("error_details"),
                "completed_at": now,
                "duration_seconds": duration,
            })

    def fail_job(self, job_id: str, error_details: list = None):
        self.db.query(CrawlJobLog).filter(CrawlJobLog.id == job_id).update({
            "status": "failed",
            "completed_at": datetime.utcnow(),
            "error_details": error_details,
        })

    def get_recent(self, limit: int = 20) -> list[CrawlJobLog]:
        return (
            self.db.query(CrawlJobLog)
            .order_by(CrawlJobLog.started_at.desc())
            .limit(limit)
            .all()
        )

    def get_last_by_source(self, source: str) -> CrawlJobLog | None:
        return (
            self.db.query(CrawlJobLog)
            .filter(CrawlJobLog.source == source)
            .order_by(CrawlJobLog.started_at.desc())
            .first()
        )
