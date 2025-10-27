import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/properties/[id] - 특정 숙소 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const property = await prisma.property.findUnique({
      where: {
        id: params.id,
      },
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
                email: true,
              },
            },
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "숙소를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json({ property });
  } catch (error) {
    console.error("숙소 조회 오류:", error);
    return NextResponse.json(
      { error: "숙소 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}
