import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/prisma";

// GET /api/pm/prds/[id] - 특정 PRD 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getUser();
    const userId = authUser?.profile?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const prd = await prisma.pRD.findFirst({
      where: {
        id: params.id,
        project: {
          creatorId: userId,
        },
      },
      include: {
        requirements: {
          orderBy: {
            number: "asc",
          },
        },
        epics: {
          include: {
            stories: {
              include: {
                acceptanceCriteria: true,
                integrationVerification: true,
              },
              orderBy: {
                storyNumber: "asc",
              },
            },
          },
          orderBy: {
            number: "asc",
          },
        },
        changeLogs: {
          orderBy: {
            date: "desc",
          },
        },
        project: true,
      },
    });

    if (!prd) {
      return NextResponse.json(
        { error: "PRD를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json({ prd });
  } catch (error) {
    console.error("PRD 조회 오류:", error);
    return NextResponse.json(
      { error: "PRD 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}

// PATCH /api/pm/prds/[id] - PRD 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getUser();
    const userId = authUser?.profile?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, type, goals, background, uiGoals, technicalAssum, status } =
      body;

    // PRD 소유권 확인
    const existingPrd = await prisma.pRD.findFirst({
      where: {
        id: params.id,
        project: {
          creatorId: userId,
        },
      },
    });

    if (!existingPrd) {
      return NextResponse.json(
        { error: "PRD를 찾을 수 없거나 권한이 없습니다" },
        { status: 404 }
      );
    }

    const prd = await prisma.pRD.update({
      where: {
        id: params.id,
      },
      data: {
        ...(title && { title }),
        ...(type && { type }),
        ...(goals && { goals }),
        ...(background && { background }),
        ...(uiGoals !== undefined && { uiGoals }),
        ...(technicalAssum !== undefined && { technicalAssum }),
        ...(status && { status }),
      },
      include: {
        requirements: true,
        epics: true,
      },
    });

    return NextResponse.json({ prd });
  } catch (error) {
    console.error("PRD 수정 오류:", error);
    return NextResponse.json(
      { error: "PRD 수정에 실패했습니다" },
      { status: 500 }
    );
  }
}

// DELETE /api/pm/prds/[id] - PRD 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getUser();
    const userId = authUser?.profile?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    // PRD 소유권 확인
    const existingPrd = await prisma.pRD.findFirst({
      where: {
        id: params.id,
        project: {
          creatorId: userId,
        },
      },
    });

    if (!existingPrd) {
      return NextResponse.json(
        { error: "PRD를 찾을 수 없거나 권한이 없습니다" },
        { status: 404 }
      );
    }

    await prisma.pRD.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: "PRD가 삭제되었습니다" });
  } catch (error) {
    console.error("PRD 삭제 오류:", error);
    return NextResponse.json(
      { error: "PRD 삭제에 실패했습니다" },
      { status: 500 }
    );
  }
}
