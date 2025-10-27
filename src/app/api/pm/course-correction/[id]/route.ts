import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/pm/course-correction/[id] - Course Correction 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const courseCorrection = await prisma.courseCorrection.findFirst({
      where: {
        id: params.id,
      },
    });

    if (!courseCorrection) {
      return NextResponse.json(
        { error: "Course Correction을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 프로젝트 소유권 확인
    const project = await prisma.pMProject.findUnique({
      where: {
        id: courseCorrection.projectId,
        creatorId: userId,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "권한이 없습니다" },
        { status: 403 }
      );
    }

    return NextResponse.json({ courseCorrection });
  } catch (error) {
    console.error("Course Correction 조회 오류:", error);
    return NextResponse.json(
      { error: "Course Correction 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}

// PATCH /api/pm/course-correction/[id] - Course Correction 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, changeTrigger, impactAnalysis, proposedChanges, status } =
      body;

    // Course Correction 조회 및 소유권 확인
    const existingCC = await prisma.courseCorrection.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingCC) {
      return NextResponse.json(
        { error: "Course Correction을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    const project = await prisma.pMProject.findUnique({
      where: {
        id: existingCC.projectId,
        creatorId: userId,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "권한이 없습니다" },
        { status: 403 }
      );
    }

    const courseCorrection = await prisma.courseCorrection.update({
      where: {
        id: params.id,
      },
      data: {
        ...(title && { title }),
        ...(changeTrigger && { changeTrigger }),
        ...(impactAnalysis !== undefined && { impactAnalysis }),
        ...(proposedChanges !== undefined && { proposedChanges }),
        ...(status && { status }),
      },
    });

    return NextResponse.json({ courseCorrection });
  } catch (error) {
    console.error("Course Correction 수정 오류:", error);
    return NextResponse.json(
      { error: "Course Correction 수정에 실패했습니다" },
      { status: 500 }
    );
  }
}
