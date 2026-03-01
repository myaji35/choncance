-- VINTEE Intelligence Pipeline (VIP) 마이그레이션
-- 전국 펜션 크롤링 + VINTEE Score 시스템

-- CreateTable: raw_crawl_results
CREATE TABLE "raw_crawl_results" (
    "id" TEXT NOT NULL,
    "source" VARCHAR(20) NOT NULL,
    "sourceId" VARCHAR(200),
    "name" VARCHAR(300) NOT NULL,
    "address" TEXT,
    "phone" VARCHAR(30),
    "lat" DECIMAL(10,7),
    "lng" DECIMAL(10,7),
    "sourceRating" DECIMAL(3,2),
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "rawReviews" JSONB,
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "extraData" JSONB,
    "crawledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "raw_crawl_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable: property_intelligence
CREATE TABLE "property_intelligence" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(300) NOT NULL,
    "address" TEXT,
    "region" VARCHAR(50),
    "subregion" VARCHAR(50),
    "lat" DECIMAL(10,7),
    "lng" DECIMAL(10,7),
    "phone" VARCHAR(30),
    "avgRating" DECIMAL(3,2),
    "totalReviews" INTEGER,
    "sentimentScore" DECIMAL(4,3),
    "themeScore" DECIMAL(4,3),
    "recencyScore" DECIMAL(4,3),
    "vinteeScore" DECIMAL(3,2),
    "autoTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isRecruited" BOOLEAN NOT NULL DEFAULT false,
    "recruitNote" TEXT,
    "recruitedAt" TIMESTAMP(3),
    "naverId" VARCHAR(200),
    "kakaoId" VARCHAR(200),
    "yanoljaId" VARCHAR(200),
    "yeogiId" VARCHAR(200),
    "airbnbId" VARCHAR(200),
    "thumbnailUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_intelligence_pkey" PRIMARY KEY ("id")
);

-- CreateTable: crawl_job_logs
CREATE TABLE "crawl_job_logs" (
    "id" TEXT NOT NULL,
    "source" VARCHAR(20) NOT NULL,
    "region" VARCHAR(50),
    "status" VARCHAR(20) NOT NULL,
    "totalCrawled" INTEGER NOT NULL DEFAULT 0,
    "newProperties" INTEGER NOT NULL DEFAULT 0,
    "updatedProperties" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "errorDetails" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER,

    CONSTRAINT "crawl_job_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "raw_crawl_results_source_idx" ON "raw_crawl_results"("source");
CREATE INDEX "raw_crawl_results_isProcessed_idx" ON "raw_crawl_results"("isProcessed");
CREATE INDEX "raw_crawl_results_crawledAt_idx" ON "raw_crawl_results"("crawledAt");

CREATE INDEX "property_intelligence_region_idx" ON "property_intelligence"("region");
CREATE INDEX "property_intelligence_vinteeScore_idx" ON "property_intelligence"("vinteeScore" DESC);
CREATE INDEX "property_intelligence_isRecruited_idx" ON "property_intelligence"("isRecruited");
CREATE INDEX "property_intelligence_autoTags_idx" ON "property_intelligence" USING GIN ("autoTags");

CREATE INDEX "crawl_job_logs_source_idx" ON "crawl_job_logs"("source");
CREATE INDEX "crawl_job_logs_status_idx" ON "crawl_job_logs"("status");
CREATE INDEX "crawl_job_logs_startedAt_idx" ON "crawl_job_logs"("startedAt" DESC);
