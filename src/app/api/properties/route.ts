import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/properties - 숙소 목록 조회 (태그 필터링 지원)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tagsParam = searchParams.get("tags"); // 쉼표로 구분된 태그명 (#논뷰맛집,#힐링)
    const status = searchParams.get("status") || "APPROVED";

    // 태그 필터링 조건 구성
    const whereClause: any = {
      status,
    };

    if (tagsParam) {
      const tagNames = tagsParam.split(",").map((tag) => tag.trim());

      // 선택된 태그를 모두 가진 숙소만 필터링 (AND 조건)
      whereClause.tags = {
        some: {
          name: {
            in: tagNames,
          },
        },
      };
    }

    const properties = await prisma.property.findMany({
      where: whereClause,
      include: {
        tags: {
          orderBy: {
            category: "asc",
          },
        },
        host: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            tags: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ properties });
  } catch (error) {
    console.error("숙소 조회 오류:", error);
    return NextResponse.json(
      { error: "숙소 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}
