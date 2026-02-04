import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/prisma";

// GET /api/pm/epics/[id] - 특정 Epic 조회
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

    const epic = await prisma.epic.findFirst({
      where: {
        id: params.id,
        OR: [
          {
            project: {
              creatorId: userId,
            },
          },
          {
            prd: {
              project: {
                creatorId: userId,
              },
            },
          },
        ],
      },
      include: {
        stories: {
          include: {
            acceptanceCriteria: {
              orderBy: {
                number: "asc",
              },
            },
            integrationVerification: {
              orderBy: {
                number: "asc",
              },
            },
          },
          orderBy: {
            storyNumber: "asc",
          },
        },
        project: true,
        prd: true,
      },
    });

    if (!epic) {
      return NextResponse.json(
        { error: "Epic을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json({ epic });
  } catch (error) {
    console.error("Epic 조회 오류:", error);
    return NextResponse.json(
      { error: "Epic 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}

// PATCH /api/pm/epics/[id] - Epic 수정
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
    const { title, goal, status } = body;

    // Epic 소유권 확인
    const existingEpic = await prisma.epic.findFirst({
      where: {
        id: params.id,
        OR: [
          {
            project: {
              creatorId: userId,
            },
          },
          {
            prd: {
              project: {
                creatorId: userId,
              },
            },
          },
        ],
      },
    });

    if (!existingEpic) {
      return NextResponse.json(
        { error: "Epic을 찾을 수 없거나 권한이 없습니다" },
        { status: 404 }
      );
    }

    const epic = await prisma.epic.update({
      where: {
        id: params.id,
      },
      data: {
        ...(title && { title }),
        ...(goal && { goal }),
        ...(status && { status }),
      },
      include: {
        stories: true,
      },
    });

    return NextResponse.json({ epic });
  } catch (error) {
    console.error("Epic 수정 오류:", error);
    return NextResponse.json(
      { error: "Epic 수정에 실패했습니다" },
      { status: 500 }
    );
  }
}

// DELETE /api/pm/epics/[id] - Epic 삭제
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

    // Epic 소유권 확인
    const existingEpic = await prisma.epic.findFirst({
      where: {
        id: params.id,
        OR: [
          {
            project: {
              creatorId: userId,
            },
          },
          {
            prd: {
              project: {
                creatorId: userId,
              },
            },
          },
        ],
      },
    });

    if (!existingEpic) {
      return NextResponse.json(
        { error: "Epic을 찾을 수 없거나 권한이 없습니다" },
        { status: 404 }
      );
    }

    await prisma.epic.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: "Epic이 삭제되었습니다" });
  } catch (error) {
    console.error("Epic 삭제 오류:", error);
    return NextResponse.json(
      { error: "Epic 삭제에 실패했습니다" },
      { status: 500 }
    );
  }
}
