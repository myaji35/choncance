"""
VINTEE Intelligence Pipeline (VIP)
메인 진입점: APScheduler로 주기적 크롤링 실행
"""
import asyncio
import signal
import sys
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from config import (
    ANTHROPIC_API_KEY, SCHEDULE_CONFIG, TARGET_REGIONS, CRAWL_CONFIG
)
from adapters import CRAWLER_REGISTRY
from pipeline import Normalizer, VinteeScoreEngine, TagClassifier
from db import get_db, CrawlRepository, JobLogRepository
from utils import get_logger

logger = get_logger("main")


async def run_pipeline_for_region(source: str, region: str):
    """단일 소스 + 지역 파이프라인 실행"""
    crawler_class = CRAWLER_REGISTRY.get(source)
    if not crawler_class:
        logger.error("크롤러 없음", source=source)
        return

    with get_db() as db:
        crawl_repo = CrawlRepository(db)
        job_repo = JobLogRepository(db)

        # 작업 시작 로그
        job = job_repo.start_job(source=source, region=region)
        db.flush()
        job_id = job.id

        stats = {
            "total_crawled": 0,
            "new_properties": 0,
            "updated_properties": 0,
            "error_count": 0,
            "error_details": [],
        }

        try:
            # 1. 크롤링
            crawler = crawler_class()
            properties = await crawler.crawl_region(region)

            # 2. 원시 데이터 저장
            for prop in properties:
                try:
                    crawl_repo.save_raw(prop.to_dict())
                    stats["total_crawled"] += 1
                except Exception as e:
                    stats["error_count"] += 1
                    stats["error_details"].append({
                        "source_id": prop.source_id,
                        "error": str(e),
                    })

            # 3. 정규화 + Score 엔진 처리
            score_engine = VinteeScoreEngine(ANTHROPIC_API_KEY)
            tag_classifier = TagClassifier()

            unprocessed = crawl_repo.get_unprocessed(limit=500)

            for raw in unprocessed:
                try:
                    raw_dict = {
                        "source": raw.source,
                        "source_id": raw.source_id,
                        "name": raw.name,
                        "address": raw.address,
                        "source_rating": float(raw.source_rating) if raw.source_rating else None,
                        "review_count": raw.review_count or 0,
                        "raw_reviews": raw.raw_reviews or [],
                    }

                    # Score 계산
                    scores = score_engine.calculate([raw_dict])

                    # 태그 분류
                    tags = tag_classifier.classify(
                        reviews=raw.raw_reviews or [],
                        name=raw.name,
                        amenities=raw.amenities or [],
                        address=raw.address or "",
                    )

                    # PropertyIntelligence upsert
                    from utils import parse_region
                    region_parsed, subregion = parse_region(raw.address or "")

                    intel_data = {
                        "name": raw.name,
                        "address": raw.address,
                        "region": region_parsed,
                        "subregion": subregion,
                        "lat": float(raw.lat) if raw.lat else None,
                        "lng": float(raw.lng) if raw.lng else None,
                        "phone": raw.phone,
                        "avg_rating": scores["avg_rating"],
                        "total_reviews": scores["total_reviews"],
                        "sentiment_score": scores["sentiment_score"],
                        "theme_score": scores["theme_score"],
                        "recency_score": scores["recency_score"],
                        "vintee_score": scores["vintee_score"],
                        "auto_tags": tags,
                        f"{raw.source}_id": raw.source_id,
                    }

                    result = crawl_repo.upsert_intelligence(intel_data)
                    if result:
                        stats["new_properties"] += 1

                    # 처리 완료 표시
                    crawl_repo.mark_processed(raw.id)

                except Exception as e:
                    stats["error_count"] += 1
                    logger.warning("처리 실패", raw_id=raw.id, error=str(e))

            # 작업 완료 로그
            job_repo.complete_job(job_id, stats)
            logger.info(
                "파이프라인 완료",
                source=source,
                region=region,
                **stats,
            )

        except Exception as e:
            job_repo.fail_job(job_id, [{"error": str(e)}])
            logger.error("파이프라인 실패", source=source, region=region, error=str(e))


async def full_crawl():
    """전국 전체 크롤링 (주 1회)"""
    logger.info("전국 크롤링 시작")
    active_sources = ["naver", "kakao", "yanolja"]  # Sprint 1: 3개 소스

    for region in TARGET_REGIONS:
        for source in active_sources:
            await run_pipeline_for_region(source, region)

    logger.info("전국 크롤링 완료")


async def incremental_crawl():
    """증분 크롤링 (일 1회 — 변경분만)"""
    logger.info("증분 크롤링 시작")
    priority_regions = ["강원도", "경기도", "충청남도"]  # 우선 지역
    await asyncio.gather(*[
        run_pipeline_for_region("naver", region)
        for region in priority_regions
    ])
    logger.info("증분 크롤링 완료")


def main():
    scheduler = AsyncIOScheduler()

    # 주 1회 전체 크롤링 (일요일 02:00)
    scheduler.add_job(
        full_crawl,
        CronTrigger.from_crontab(SCHEDULE_CONFIG["full_crawl"]),
        id="full_crawl",
        name="전국 크롤링",
    )

    # 일 1회 증분 크롤링 (03:00)
    scheduler.add_job(
        incremental_crawl,
        CronTrigger.from_crontab(SCHEDULE_CONFIG["incremental"]),
        id="incremental_crawl",
        name="증분 크롤링",
    )

    scheduler.start()
    logger.info("VINTEE Intelligence Pipeline 시작", config=CRAWL_CONFIG)

    # Graceful shutdown
    def shutdown(sig, frame):
        logger.info("종료 신호 수신, 스케줄러 종료 중...")
        scheduler.shutdown()
        sys.exit(0)

    signal.signal(signal.SIGTERM, shutdown)
    signal.signal(signal.SIGINT, shutdown)

    try:
        asyncio.get_event_loop().run_forever()
    except (KeyboardInterrupt, SystemExit):
        pass


if __name__ == "__main__":
    # 즉시 실행 모드 (테스트용)
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--run-now", choices=["full", "incremental", "region"])
    parser.add_argument("--region", default="강원도")
    parser.add_argument("--source", default="naver")
    args = parser.parse_args()

    if args.run_now == "full":
        asyncio.run(full_crawl())
    elif args.run_now == "incremental":
        asyncio.run(incremental_crawl())
    elif args.run_now == "region":
        asyncio.run(run_pipeline_for_region(args.source, args.region))
    else:
        main()
