import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/prisma";

// POST /api/pm/prds - 새 PRD 생성
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    const userId = user?.profile?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      projectId,
      title,
      type,
      goals,
      background,
      uiGoals,
      technicalAssum,
      requirements,
    } = body;

    if (!projectId || !title || !type || !goals || !background) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다" },
        { status: 400 }
      );
    }

    // 프로젝트 소유권 확인
    const project = await prisma.pMProject.findUnique({
      where: {
        id: projectId,
        creatorId: userId,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "프로젝트를 찾을 수 없거나 권한이 없습니다" },
        { status: 404 }
      );
    }

    const prd = await prisma.pRD.create({
      data: {
        projectId,
        title,
        type,
        goals,
        background,
        uiGoals,
        technicalAssum,
        requirements: requirements
          ? {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              create: requirements.map((req: any, index: number) => ({
                prefix: req.prefix,
                number: index + 1,
                description: req.description,
                type: req.type,
              })),
            }
          : undefined,
      },
      include: {
        requirements: true,
      },
    });

    return NextResponse.json({ prd }, { status: 201 });
  } catch (error) {
    console.error("PRD 생성 오류:", error);
    return NextResponse.json(
      { error: "PRD 생성에 실패했습니다" },
      { status: 500 }
    );
  }
}
