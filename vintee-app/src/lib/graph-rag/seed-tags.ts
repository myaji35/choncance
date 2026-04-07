// 규칙 기반 태그 시딩 (OpenAI 없이 동작)
// 실행: npx tsx src/lib/graph-rag/seed-tags.ts

import { PrismaClient } from "../../generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";
import { TAG_SEEDS, matchTagsInText, type TagSeed } from "./tag-taxonomy";
import { parseJsonArray, type NearbyAttraction } from "../utils/geo";

const dbPath =
  process.env.DATABASE_FILE ??
  (process.cwd().includes("(") ? "/tmp/vintee-dev.db" : path.resolve(process.cwd(), "dev.db"));
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function upsertTagSeeds() {
  console.log(`[seed-tags] Tag 시드 업서트 시작 (${TAG_SEEDS.length}개)`);
  for (const seed of TAG_SEEDS) {
    await prisma.tag.upsert({
      where: { slug: seed.slug },
      update: { name: seed.name, type: seed.type },
      create: { slug: seed.slug, name: seed.name, type: seed.type },
    });
  }
  console.log(`[seed-tags] Tag 시드 완료`);
}

async function seedRegions() {
  console.log(`[seed-tags] Region 계층 시딩`);
  // 시/도 → 시/군 2단계만 간단히
  const regions: { name: string; slug: string; level: number; parentSlug?: string }[] = [
    { name: "충남", slug: "region-chungnam", level: 1 },
    { name: "충남 아산", slug: "region-chungnam-asan", level: 2, parentSlug: "region-chungnam" },
    { name: "강원", slug: "region-gangwon", level: 1 },
    { name: "강원 평창", slug: "region-gangwon-pyeongchang", level: 2, parentSlug: "region-gangwon" },
    { name: "경남", slug: "region-gyeongnam", level: 1 },
    { name: "경남 통영", slug: "region-gyeongnam-tongyeong", level: 2, parentSlug: "region-gyeongnam" },
    { name: "제주", slug: "region-jeju", level: 1 },
    { name: "제주 서귀포", slug: "region-jeju-seogwipo", level: 2, parentSlug: "region-jeju" },
    { name: "전남", slug: "region-jeonnam", level: 1 },
    { name: "전남 담양", slug: "region-jeonnam-damyang", level: 2, parentSlug: "region-jeonnam" },
  ];

  for (const r of regions.filter((x) => x.level === 1)) {
    await prisma.region.upsert({
      where: { slug: r.slug },
      update: { name: r.name, level: r.level },
      create: { slug: r.slug, name: r.name, level: r.level },
    });
  }
  for (const r of regions.filter((x) => x.level === 2)) {
    const parent = r.parentSlug
      ? await prisma.region.findUnique({ where: { slug: r.parentSlug } })
      : null;
    await prisma.region.upsert({
      where: { slug: r.slug },
      update: { name: r.name, level: r.level, parentId: parent?.id },
      create: { slug: r.slug, name: r.name, level: r.level, parentId: parent?.id },
    });
  }
  console.log(`[seed-tags] Region ${regions.length}개 완료`);
}

async function linkPropertyRegions() {
  console.log(`[seed-tags] Property → Region 매핑`);
  const properties = await prisma.property.findMany({
    select: { id: true, location: true },
  });
  const regions = await prisma.region.findMany({ where: { level: 2 } });

  for (const p of properties) {
    const match = regions.find((r) => p.location.startsWith(r.name));
    if (match) {
      await prisma.property.update({
        where: { id: p.id },
        data: { regionId: match.id },
      });
    }
  }
  console.log(`[seed-tags] 매핑 완료`);
}

async function seedPropertyTags() {
  console.log(`[seed-tags] PropertyTag 규칙 기반 시딩`);
  const properties = await prisma.property.findMany();
  const allTags = await prisma.tag.findMany();
  const tagBySlug = new Map(allTags.map((t) => [t.slug, t]));

  let totalCreated = 0;

  for (const p of properties) {
    // 텍스트 매칭 대상: title, description, highlights, uniqueExperience, hostIntro
    const searchText = [
      p.title,
      p.description ?? "",
      ...parseJsonArray<string>(p.highlights),
      p.uniqueExperience ?? "",
      p.hostIntro ?? "",
    ].join(" ");

    const matchedSeeds = matchTagsInText(searchText);
    const tagIds = new Set<string>();

    for (const seed of matchedSeeds) {
      const tag = tagBySlug.get(seed.slug);
      if (tag) tagIds.add(tag.id);
    }

    // 명시적 필드 → 태그 매핑
    if (p.petsAllowed) {
      const t = tagBySlug.get("feature-pets-allowed");
      if (t) tagIds.add(t.id);
      const t2 = tagBySlug.get("audience-pet-owner");
      if (t2) tagIds.add(t2.id);
    }

    // bestSeason → season 태그
    if (p.bestSeason) {
      const seasonMap: Record<string, string> = {
        "봄": "season-spring",
        "여름": "season-summer",
        "가을": "season-autumn",
        "겨울": "season-winter",
        "사계절": "season-all",
        "봄/가을": "season-spring", // 메인만
      };
      const seasonSlug = seasonMap[p.bestSeason];
      if (seasonSlug) {
        const t = tagBySlug.get(seasonSlug);
        if (t) tagIds.add(t.id);
      }
      // "봄/가을"은 가을도 추가
      if (p.bestSeason === "봄/가을") {
        const t = tagBySlug.get("season-autumn");
        if (t) tagIds.add(t.id);
      }
    }

    // PropertyTag upsert
    for (const tagId of tagIds) {
      await prisma.propertyTag.upsert({
        where: { propertyId_tagId: { propertyId: p.id, tagId } },
        update: { score: 1.0, source: "auto_rule" },
        create: { propertyId: p.id, tagId, score: 1.0, source: "auto_rule" },
      });
      totalCreated++;
    }

    console.log(`  [${p.title}] ${tagIds.size}개 태그`);
  }

  console.log(`[seed-tags] PropertyTag 총 ${totalCreated}건 생성/갱신`);
}

async function seedAttractions() {
  console.log(`[seed-tags] Attraction 시딩`);
  const properties = await prisma.property.findMany();

  let totalCreated = 0;
  for (const p of properties) {
    const attractions = parseJsonArray<NearbyAttraction>(p.nearbyAttractions);
    for (const a of attractions) {
      if (a.latitude === undefined || a.longitude === undefined) continue;

      // Attraction upsert by name + 좌표 (이름 중복 허용, 좌표로 구분)
      let attraction = await prisma.attraction.findFirst({
        where: { name: a.name, latitude: a.latitude, longitude: a.longitude },
      });
      if (!attraction) {
        attraction = await prisma.attraction.create({
          data: {
            name: a.name,
            latitude: a.latitude,
            longitude: a.longitude,
          },
        });
      }

      // Haversine으로 거리 계산
      const distanceKm =
        p.latitude && p.longitude
          ? haversine(p.latitude, p.longitude, a.latitude, a.longitude)
          : 0;

      await prisma.propertyAttraction.upsert({
        where: {
          propertyId_attractionId: { propertyId: p.id, attractionId: attraction.id },
        },
        update: { distanceKm, travelTime: a.distance },
        create: {
          propertyId: p.id,
          attractionId: attraction.id,
          distanceKm,
          travelTime: a.distance,
        },
      });
      totalCreated++;
    }
  }
  console.log(`[seed-tags] Attraction 링크 ${totalCreated}건 완료`);
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function main() {
  await upsertTagSeeds();
  await seedRegions();
  await linkPropertyRegions();
  await seedPropertyTags();
  await seedAttractions();

  // 요약
  const counts = {
    tags: await prisma.tag.count(),
    propertyTags: await prisma.propertyTag.count(),
    regions: await prisma.region.count(),
    attractions: await prisma.attraction.count(),
    propertyAttractions: await prisma.propertyAttraction.count(),
  };
  console.log("\n[seed-tags] 최종 카운트:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
