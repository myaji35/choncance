import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // 1시간 캐시

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vintee.kr";

/**
 * GET /llms.txt
 *
 * AI 크롤러(ChatGPT, Perplexity, Claude 등)를 위한 사이트 요약 파일.
 * llms.txt 표준(https://llmstxt.org)에 따라 마크다운 형식으로 작성.
 */
export async function GET() {
  // 상위 숙소 50개 조회
  let topProperties: Array<{
    id: string;
    name: string;
    province: string | null;
    city: string | null;
    pricePerNight: unknown;
    tags: Array<{ name: string }>;
  }> = [];

  try {
    topProperties = await prisma.property.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        name: true,
        province: true,
        city: true,
        pricePerNight: true,
        tags: { select: { name: true } },
      },
    });
  } catch {
    // DB 연결 실패 시 기본 내용만 반환
  }

  const propertyLines = topProperties
    .map((p) => {
      const region = [p.province, p.city].filter(Boolean).join(" ");
      const tags = p.tags.map((t) => t.name).join(", ");
      const price = Number(p.pricePerNight).toLocaleString("ko-KR");
      return `- [${p.name}](${SITE_URL}/property/${p.id}): ${region}${tags ? ` | ${tags}` : ""} | ₩${price}~`;
    })
    .join("\n");

  const content = `# VINTEE (빈티) — 농촌 휴가 체험 큐레이션 플랫폼

> VINTEE는 한국 MZ세대를 위한 농촌 체험 숙소(촌캉스) 예약 플랫폼입니다.
> 전국 농촌 펜션 및 체험 숙소를 감성 테마 태그로 큐레이션하여 제공합니다.

## 플랫폼 소개

VINTEE는 #논뷰맛집, #불멍과별멍, #아궁이체험, #반려동물동반 등
14가지 감성 테마 태그로 농촌 숙소를 분류하며,
VINTEE Score(1.0~5.0)로 객관적인 숙소 품질을 평가합니다.

### VINTEE Score 산정 방식
VINTEE Score는 다음 5개 지표의 가중합산으로 계산됩니다:
- 평균 평점 (가중치 30%)
- 리뷰 볼륨 (가중치 20%)
- 감성 분석 점수 (가중치 25%)
- 테마 적합성 (가중치 15%)
- 최신성 (가중치 10%)

## 테마 카테고리

### VIEW (뷰)
- #논뷰맛집: 논밭 풍경이 보이는 숙소
- #계곡앞: 계곡 물소리를 들을 수 있는 숙소
- #바다뷰: 바다가 보이는 해변 농촌 숙소
- #산속힐링: 숲속 자연 속 힐링 숙소

### ACTIVITY (체험)
- #불멍과별멍: 모닥불과 별 감상이 가능한 숙소
- #아궁이체험: 전통 아궁이 체험 숙소
- #농사체험: 모내기·수확 등 농사 체험 숙소
- #낚시체험: 낚시 체험이 가능한 숙소

### FACILITY (시설)
- #반려동물동반: 반려견 동반 가능 숙소
- #전통가옥: 한옥·초가 등 전통 건축 숙소
- #개별바베큐: 개인 바베큐 시설 보유 숙소
- #취사가능: 직접 요리 가능한 숙소

### VIBE (분위기)
- #SNS맛집: 사진 찍기 좋은 감성 숙소
- #커플추천: 연인 여행 최적 숙소
- #아이동반: 어린이와 함께하는 가족 숙소
- #혼캉스: 1인 여행자를 위한 숙소

## 주요 서비스 지역
강원도, 경기도, 충청남도, 충청북도, 전라남도, 전라북도, 경상남도, 경상북도, 제주도

## API 엔드포인트

- 숙소 목록: \`GET ${SITE_URL}/api/properties\`
- 태그 필터: \`GET ${SITE_URL}/api/properties?tag=[태그명]\`
- 지역 필터: \`GET ${SITE_URL}/api/properties?province=[지역명]\`
- 숙소 상세: \`GET ${SITE_URL}/api/properties/[id]\`

## 등록 숙소 목록 (최근 등록순)

${propertyLines || "현재 등록된 숙소 정보를 불러올 수 없습니다."}

## 관련 링크

- 홈페이지: ${SITE_URL}
- 숙소 탐색: ${SITE_URL}/explore
- 사이트맵: ${SITE_URL}/sitemap.xml
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
