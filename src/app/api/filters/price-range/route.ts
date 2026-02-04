import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

/**
 * GET /api/filters/price-range
 *
 * 현재 등록된 숙소의 가격 범위 조회
 *
 * Response:
 * {
 *   min_price: 50000,
 *   max_price: 450000,
 *   average_price: 120000
 * }
 */
export async function GET() {
  try {
    // 승인된 숙소의 가격 통계 조회
    const priceStats = await prisma.property.aggregate({
      where: {
        status: "APPROVED",
      },
      _min: {
        pricePerNight: true,
      },
      _max: {
        pricePerNight: true,
      },
      _avg: {
        pricePerNight: true,
      },
    });

    const minPrice = priceStats._min.pricePerNight
      ? Number(priceStats._min.pricePerNight)
      : 50000;

    const maxPrice = priceStats._max.pricePerNight
      ? Number(priceStats._max.pricePerNight)
      : 500000;

    const avgPrice = priceStats._avg.pricePerNight
      ? Math.round(Number(priceStats._avg.pricePerNight))
      : 120000;

    return NextResponse.json({
      min_price: minPrice,
      max_price: maxPrice,
      average_price: avgPrice,
    });
  } catch (error) {
    console.error("Failed to fetch price range:", error);
    return NextResponse.json(
      { error: "가격 범위를 불러오지 못했습니다" },
      { status: 500 }
    );
  }
}
