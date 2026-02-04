import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/prisma";

// POST /api/pm/epics - 새 Epic 생성
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
    const { projectId, prdId, number, title, goal, type } = body;

    if (!title || !goal || number === undefined) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다" },
        { status: 400 }
      );
    }

    // 프로젝트 또는 PRD 소유권 확인
    if (projectId) {
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
    }

    if (prdId) {
      const prd = await prisma.pRD.findFirst({
        where: {
          id: prdId,
          project: {
            creatorId: userId,
          },
        },
      });

      if (!prd) {
        return NextResponse.json(
          { error: "PRD를 찾을 수 없거나 권한이 없습니다" },
          { status: 404 }
        );
      }
    }

    const epic = await prisma.epic.create({
      data: {
        number,
        title,
        goal,
        type: type || "greenfield",
        ...(projectId && { projectId }),
        ...(prdId && { prdId }),
      },
    });

    return NextResponse.json({ epic }, { status: 201 });
  } catch (error) {
    console.error("Epic 생성 오류:", error);
    return NextResponse.json(
      { error: "Epic 생성에 실패했습니다" },
      { status: 500 }
    );
  }
}
