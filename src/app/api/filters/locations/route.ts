import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/filters/locations
 *
 * 지역 필터 옵션 조회 (시/도 및 시/군/구)
 *
 * Query Parameters:
 * - province (optional): 시/도 (선택 시 해당 시/도의 시/군/구 반환)
 *
 * Response:
 * {
 *   provinces: [{ name: "강원도", count: 23 }],
 *   cities: [{ name: "강릉시", count: 8 }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const province = searchParams.get("province");

    // 승인된 숙소만 필터링
    const whereClause = {
      status: "APPROVED" as const,
    };

    // 시/도 목록 조회 (카운트 포함)
    const provinceGroups = await prisma.property.groupBy({
      by: ["province"],
      where: {
        ...whereClause,
        province: { not: null },
      },
      _count: { id: true },
    });

    const provinces = provinceGroups
      .filter(group => group.province !== null)
      .map(group => ({
        name: group.province!,
        count: group._count.id,
      }))
      .sort((a, b) => b.count - a.count); // 숙소 많은 순

    // 시/군/구 목록 조회
    let cities: { name: string; count: number }[] = [];

    if (province) {
      const cityGroups = await prisma.property.groupBy({
        by: ["city"],
        where: {
          ...whereClause,
          province,
          city: { not: null },
        },
        _count: { id: true },
      });

      cities = cityGroups
        .filter(group => group.city !== null)
        .map(group => ({
          name: group.city!,
          count: group._count.id,
        }))
        .sort((a, b) => b.count - a.count);
    }

    return NextResponse.json({
      provinces,
      cities,
    });
  } catch (error) {
    console.error("Failed to fetch location filters:", error);
    return NextResponse.json(
      { error: "지역 필터를 불러오지 못했습니다" },
      { status: 500 }
    );
  }
}
