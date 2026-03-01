import { prisma } from "@/lib/prisma";
import { fetchGooglePlaces } from "./sources/google";
import { fetchNaverPlaces } from "./sources/naver";
import { normalizeData, extractRegion, extractAutoTags } from "./normalizer";
import { calculateVinteeScore } from "./score-calculator";
import type { CrawlJobRequest, CrawlSource, RawPropertyData, NormalizedData } from "./types";

const QUERIES = ["펜션", "게스트하우스", "독채펜션", "농촌체험숙소", "한옥스테이"];

/**
 * 단일 소스에서 데이터 수집
 */
async function collectFromSource(
  source: CrawlSource,
  region?: string,
  limit = 100
): Promise<RawPropertyData[]> {
  switch (source) {
    case "google":
      return fetchGooglePlaces(region ? `${region} 펜션` : "펜션", region);
    case "naver": {
      const results: RawPropertyData[] = [];
      for (const q of QUERIES.slice(0, 3)) {
        const items = await fetchNaverPlaces(q, region, Math.ceil(limit / 3));
        results.push(...items);
      }
      return results;
    }
    default:
      console.warn(`[Collect] 소스 '${source}' 미구현 — 건너뜀`);
      return [];
  }
}

/**
 * 수집된 원시 데이터를 DB에 저장
 * 반환: { newCount, updatedCount }
 */
async function saveRawResults(
  items: RawPropertyData[]
): Promise<{ newCount: number; updatedCount: number }> {
  let newCount = 0;
  let updatedCount = 0;

  for (const item of items) {
    try {
      // sourceId 기반 upsert (sourceId 없으면 name+address 기반)
      const existing = item.sourceId
        ? await prisma.rawCrawlResult.findFirst({
            where: { source: item.source, sourceId: item.sourceId },
          })
        : await prisma.rawCrawlResult.findFirst({
            where: { source: item.source, name: item.name },
          });

      const data = {
        source: item.source,
        sourceId: item.sourceId,
        name: item.name,
        address: item.address,
        phone: item.phone,
        lat: item.lat ? item.lat : undefined,
        lng: item.lng ? item.lng : undefined,
        sourceRating: item.rating ?? undefined,
        reviewCount: item.reviewCount ?? 0,
        rawReviews: item.reviews ? (item.reviews as object) : undefined,
        amenities: item.amenities ?? [],
        extraData: item.extraData ? (item.extraData as object) : undefined,
        isProcessed: false,
      };

      if (existing) {
        await prisma.rawCrawlResult.update({ where: { id: existing.id }, data });
        updatedCount++;
      } else {
        await prisma.rawCrawlResult.create({ data });
        newCount++;
      }
    } catch (err) {
      console.error(`[SaveRaw] 저장 실패 (${item.name}):`, err);
    }
  }

  return { newCount, updatedCount };
}

/**
 * PropertyIntelligence 업서트
 * 동일 숙소 여러 소스 데이터를 하나의 Intelligence 레코드로 통합
 */
async function upsertIntelligence(items: RawPropertyData[]): Promise<void> {
  // 이름 기준으로 그룹화 (실제 서비스에서는 좌표 기반 클러스터링 권장)
  const grouped = new Map<string, RawPropertyData[]>();
  for (const item of items) {
    const key = item.name.trim();
    const group = grouped.get(key) ?? [];
    group.push(item);
    grouped.set(key, group);
  }

  for (const [name, group] of Array.from(grouped.entries())) {
    try {
      const normalized = group.map(normalizeData);
      const { score, breakdown } = calculateVinteeScore(normalized);
      const { region, subregion } = extractRegion(group[0].address);
      const autoTags = extractAutoTags(name, group[0].amenities ?? []);

      // 소스별 ID 매핑
      const sourceMap: Record<string, string> = {};
      for (const item of group) {
        if (item.sourceId) sourceMap[item.source] = item.sourceId;
      }

      const primary = group[0];
      const totalReviews = breakdown.totalReviews;
      const avgRating = breakdown.naverRating ?? breakdown.googleRating ?? null;

      const data = {
        name,
        address: primary.address,
        region,
        subregion,
        lat: primary.lat ? primary.lat : undefined,
        lng: primary.lng ? primary.lng : undefined,
        phone: primary.phone,
        avgRating: avgRating ?? undefined,
        totalReviews,
        vinteeScore: score,
        autoTags,
        naverId: sourceMap["naver"],
        thumbnailUrl: primary.thumbnailUrl,
      };

      const existing = await prisma.propertyIntelligence.findFirst({
        where: { name },
      });

      if (existing) {
        await prisma.propertyIntelligence.update({ where: { id: existing.id }, data });
      } else {
        await prisma.propertyIntelligence.create({ data });
      }
    } catch (err) {
      console.error(`[Upsert] Intelligence 업서트 실패 (${name}):`, err);
    }
  }
}

/**
 * 메인 수집 오케스트레이터
 */
export async function runCrawlJob(request: CrawlJobRequest): Promise<{
  jobId: string;
  collected: number;
  newCount: number;
  updatedCount: number;
  errorCount: number;
  durationSeconds: number;
}> {
  const startTime = Date.now();

  // CrawlJobLog 생성 (running 상태)
  const job = await prisma.crawlJobLog.create({
    data: {
      source: request.source,
      region: request.region,
      status: "running",
    },
  });

  const allItems: RawPropertyData[] = [];
  const errors: Array<{ source: string; message: string }> = [];

  const sources: CrawlSource[] =
    request.source === "all" ? ["google", "naver"] : [request.source as CrawlSource];

  for (const source of sources) {
    try {
      const items = await collectFromSource(source, request.region, request.limit);
      allItems.push(...items);
      console.log(`[Crawl] ${source}: ${items.length}건 수집`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ source, message: msg });
      console.error(`[Crawl] ${source} 오류:`, msg);
    }
  }

  // DB 저장
  const { newCount, updatedCount } = await saveRawResults(allItems);

  // PropertyIntelligence 업서트
  await upsertIntelligence(allItems);

  const durationSeconds = Math.round((Date.now() - startTime) / 1000);

  // CrawlJobLog 완료 업데이트
  await prisma.crawlJobLog.update({
    where: { id: job.id },
    data: {
      status: errors.length > 0 && allItems.length === 0 ? "failed" : errors.length > 0 ? "partial" : "completed",
      totalCrawled: allItems.length,
      newProperties: newCount,
      updatedProperties: updatedCount,
      errorCount: errors.length,
      errorDetails: errors.length > 0 ? (errors as object) : undefined,
      completedAt: new Date(),
      durationSeconds,
    },
  });

  return {
    jobId: job.id,
    collected: allItems.length,
    newCount,
    updatedCount,
    errorCount: errors.length,
    durationSeconds,
  };
}
