import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/prisma";

// POST /api/pm/course-correction - Course Correction 분석 생성
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
    const { projectId, title, changeTrigger, impactAnalysis, proposedChanges } =
      body;

    if (!projectId || !title || !changeTrigger) {
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

    const courseCorrection = await prisma.courseCorrection.create({
      data: {
        projectId,
        title,
        changeTrigger,
        impactAnalysis: impactAnalysis || {},
        proposedChanges: proposedChanges || [],
      },
    });

    return NextResponse.json({ courseCorrection }, { status: 201 });
  } catch (error) {
    console.error("Course Correction 생성 오류:", error);
    return NextResponse.json(
      { error: "Course Correction 생성에 실패했습니다" },
      { status: 500 }
    );
  }
}
