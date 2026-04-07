// LLM 태그 보강 배치 스크립트
// 실행: OPENAI_API_KEY=sk-xxx npx tsx src/lib/graph-rag/enrich-llm-tags.ts

import { PrismaClient } from "../../generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";
import { extractTagsFromText, extractReviewTags } from "./llm-tagger";
import { embedText, floatsToBytes } from "./openai-client";
import { TAG_SEEDS } from "./tag-taxonomy";
import { parseJsonArray } from "../utils/geo";

const dbPath =
  process.env.DATABASE_FILE ??
  (process.cwd().includes("(") ? "/tmp/vintee-dev.db" : path.resolve(process.cwd(), "dev.db"));
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function enrichTagEmbeddings() {
  console.log("[enrich] Tag 임베딩 생성");
  const tags = await prisma.tag.findMany({ where: { embedding: null } });
  console.log(`  대상: ${tags.length}개`);

  let count = 0;
  for (const tag of tags) {
    // 태그 이름 + aliases + type으로 임베딩 문장 구성
    const seed = TAG_SEEDS.find((s) => s.slug === tag.slug);
    const aliases = seed?.aliases?.join(", ") ?? "";
    const text = `${tag.type}: ${tag.name}${aliases ? ` (${aliases})` : ""}`;

    try {
      const vec = await embedText(text);
      await prisma.tag.update({
        where: { id: tag.id },
        data: { embedding: floatsToBytes(vec) },
      });
      count++;
      if (count % 10 === 0) console.log(`  ${count}/${tags.length}`);
    } catch (err) {
      console.error(`  [${tag.slug}] 실패:`, err);
    }
  }
  console.log(`[enrich] 임베딩 ${count}개 완료`);
}

async function enrichPropertyTagsWithLlm() {
  console.log("[enrich] PropertyTag LLM 보강");
  const properties = await prisma.property.findMany({
    include: { tags: { include: { tag: true } } },
  });
  const allTags = await prisma.tag.findMany();
  const tagBySlug = new Map(allTags.map((t) => [t.slug, t]));

  let added = 0;
  for (const p of properties) {
    const text = [
      p.title,
      p.description ?? "",
      parseJsonArray<string>(p.highlights).join(", "),
      p.uniqueExperience ?? "",
      p.hostIntro ?? "",
    ]
      .filter(Boolean)
      .join("\n");

    const extracted = await extractTagsFromText(text);
    console.log(`  [${p.title}] LLM 추출 ${extracted.length}개`);

    const existingSlugs = new Set(p.tags.map((pt) => pt.tag.slug));

    for (const ex of extracted) {
      const tag = tagBySlug.get(ex.slug);
      if (!tag) continue;

      // 이미 규칙 기반으로 추가된 태그는 score 업데이트
      if (existingSlugs.has(ex.slug)) {
        await prisma.propertyTag.update({
          where: { propertyId_tagId: { propertyId: p.id, tagId: tag.id } },
          data: { score: Math.max(1.0, ex.confidence) },
        });
        continue;
      }

      // 신규 태그
      await prisma.propertyTag.create({
        data: {
          propertyId: p.id,
          tagId: tag.id,
          score: ex.confidence,
          source: "auto_llm",
        },
      });
      added++;
    }
  }
  console.log(`[enrich] LLM 보강 신규 태그 ${added}개`);
}

async function enrichReviewTags() {
  console.log("[enrich] Review 감성 태깅");
  const reviews = await prisma.review.findMany({
    include: { tags: true },
  });
  const allTags = await prisma.tag.findMany();
  const tagBySlug = new Map(allTags.map((t) => [t.slug, t]));

  let added = 0;
  for (const r of reviews) {
    if (r.tags.length > 0) continue; // 이미 처리

    const extracted = await extractReviewTags(r.content);
    console.log(`  [Review ${r.id.slice(-6)}] ${extracted.length}개 태그`);

    for (const ex of extracted) {
      const tag = tagBySlug.get(ex.slug);
      if (!tag) continue;

      await prisma.reviewTag.create({
        data: {
          reviewId: r.id,
          tagId: tag.id,
          sentiment: ex.sentiment,
        },
      });
      added++;
    }
  }
  console.log(`[enrich] ReviewTag ${added}개 생성`);
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY 환경변수가 필요합니다");
    process.exit(1);
  }

  await enrichTagEmbeddings();
  await enrichPropertyTagsWithLlm();
  await enrichReviewTags();

  const counts = {
    tags: await prisma.tag.count(),
    propertyTags: await prisma.propertyTag.count(),
    propertyTagsFromLlm: await prisma.propertyTag.count({ where: { source: "auto_llm" } }),
    reviewTags: await prisma.reviewTag.count(),
    tagsWithEmbedding: await prisma.tag.count({ where: { embedding: { not: null } } }),
  };
  console.log("\n[enrich] 최종 카운트:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
