import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vintee.kr";

const TAGS = [
  "#논뷰맛집", "#불멍과별멍", "#아궁이체험", "#농사체험",
  "#반려동물동반", "#개별바베큐", "#계곡앞", "#산속힐링",
  "#SNS맛집", "#혼캉스", "#커플추천", "#아이동반",
  "#전통가옥", "#낚시체험",
];

const REGIONS = [
  "강원도", "경기도", "충청남도", "충청북도",
  "전라남도", "전라북도", "경상남도", "경상북도", "제주도",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 승인된 숙소 목록
  let propertyUrls: MetadataRoute.Sitemap = [];
  try {
    const properties = await prisma.property.findMany({
      where: { status: "APPROVED" },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    propertyUrls = properties.map((p) => ({
      url: `${SITE_URL}/property/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.9,
    }));
  } catch {
    // DB 연결 실패 시 빈 배열 유지
  }

  // 태그별 탐색 페이지
  const tagUrls: MetadataRoute.Sitemap = TAGS.map((tag) => ({
    url: `${SITE_URL}/explore?tag=${encodeURIComponent(tag)}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // 지역별 탐색 페이지
  const regionUrls: MetadataRoute.Sitemap = REGIONS.map((region) => ({
    url: `${SITE_URL}/explore?region=${encodeURIComponent(region)}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/explore`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...propertyUrls,
    ...tagUrls,
    ...regionUrls,
  ];
}
