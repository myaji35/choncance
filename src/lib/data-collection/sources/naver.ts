import type { RawPropertyData } from "../types";

interface NaverLocalItem {
  title: string;        // HTML 태그 포함
  link: string;
  category: string;
  description: string;
  telephone: string;
  address: string;
  roadAddress: string;
  mapx: string;        // 경도 * 1e7
  mapy: string;        // 위도 * 1e7
}

interface NaverLocalResponse {
  items: NaverLocalItem[];
  total: number;
  display: number;
}

function stripHtml(str: string): string {
  return str.replace(/<[^>]+>/g, "");
}

/**
 * 네이버 지역 검색 API로 펜션 검색
 * 환경 변수: NAVER_CLIENT_ID, NAVER_CLIENT_SECRET
 */
export async function fetchNaverPlaces(
  query: string,
  region?: string,
  limit = 100
): Promise<RawPropertyData[]> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn("[Naver] NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 미설정 — 건너뜀");
    return [];
  }

  const searchQuery = region ? `${region} ${query}` : query;
  const results: RawPropertyData[] = [];
  const display = Math.min(limit, 5); // 네이버 최대 5건/요청 (무료 플랜)

  try {
    const url = new URL("https://openapi.naver.com/v1/search/local.json");
    url.searchParams.set("query", searchQuery);
    url.searchParams.set("display", String(display));
    url.searchParams.set("sort", "comment"); // 리뷰 많은 순

    const res = await fetch(url.toString(), {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
    });

    if (!res.ok) throw new Error(`네이버 API 오류: ${res.status}`);

    const data = (await res.json()) as NaverLocalResponse;

    for (const item of data.items) {
      // 경도/위도: mapx/mapy는 KATEC 좌표 (1e7 스케일)
      const lng = item.mapx ? parseInt(item.mapx) / 1e7 : undefined;
      const lat = item.mapy ? parseInt(item.mapy) / 1e7 : undefined;

      results.push({
        source: "naver",
        name: stripHtml(item.title),
        address: item.roadAddress || item.address,
        phone: item.telephone || undefined,
        lat,
        lng,
        // 네이버 로컬 검색 API는 평점을 직접 제공하지 않음
        // 실제 평점은 Place API 또는 플레이스 웹 크롤링 필요
        rating: undefined,
        reviewCount: undefined,
        extraData: {
          category: item.category,
          link: item.link,
          description: item.description,
        },
      });
    }
  } catch (err) {
    console.error("[Naver] 수집 오류:", err);
  }

  return results;
}
