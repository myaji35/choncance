import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/pm/projects - 모든 프로젝트 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const projects = await prisma.pMProject.findMany({
      where: {
        creatorId: userId,
      },
      include: {
        _count: {
          select: {
            prds: true,
            epics: true,
            stories: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("프로젝트 조회 오류:", error);
    return NextResponse.json(
      { error: "프로젝트 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}

// POST /api/pm/projects - 새 프로젝트 생성
export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "프로젝트 이름은 필수입니다" },
        { status: 400 }
      );
    }

    const project = await prisma.pMProject.create({
      data: {
        name,
        description,
        creatorId: userId,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("프로젝트 생성 오류:", error);
    return NextResponse.json(
      { error: "프로젝트 생성에 실패했습니다" },
      { status: 500 }
    );
  }
}
