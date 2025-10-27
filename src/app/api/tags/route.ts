import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/tags - 태그 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const tags = await prisma.tag.findMany({
      where: category ? { category: category as any } : undefined,
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            properties: true,
          },
        },
      },
    });

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("태그 조회 오류:", error);
    return NextResponse.json(
      { error: "태그 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}
