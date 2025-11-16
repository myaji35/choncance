import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/prisma";

// GET /api/pm/stories/[id] - 특정 Story 조회
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

    const story = await prisma.story.findFirst({
      where: {
        id: params.id,
        OR: [
          {
            project: {
              creatorId: userId,
            },
          },
          {
            epic: {
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
          },
        ],
      },
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
        epic: true,
        project: true,
      },
    });

    if (!story) {
      return NextResponse.json(
        { error: "Story를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json({ story });
  } catch (error) {
    console.error("Story 조회 오류:", error);
    return NextResponse.json(
      { error: "Story 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}

// PATCH /api/pm/stories/[id] - Story 수정
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
    const { title, userType, action, benefit, status } = body;

    // Story 소유권 확인
    const existingStory = await prisma.story.findFirst({
      where: {
        id: params.id,
        OR: [
          {
            project: {
              creatorId: userId,
            },
          },
          {
            epic: {
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
          },
        ],
      },
    });

    if (!existingStory) {
      return NextResponse.json(
        { error: "Story를 찾을 수 없거나 권한이 없습니다" },
        { status: 404 }
      );
    }

    const story = await prisma.story.update({
      where: {
        id: params.id,
      },
      data: {
        ...(title && { title }),
        ...(userType && { userType }),
        ...(action && { action }),
        ...(benefit && { benefit }),
        ...(status && { status }),
      },
      include: {
        acceptanceCriteria: true,
        integrationVerification: true,
      },
    });

    return NextResponse.json({ story });
  } catch (error) {
    console.error("Story 수정 오류:", error);
    return NextResponse.json(
      { error: "Story 수정에 실패했습니다" },
      { status: 500 }
    );
  }
}

// DELETE /api/pm/stories/[id] - Story 삭제
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

    // Story 소유권 확인
    const existingStory = await prisma.story.findFirst({
      where: {
        id: params.id,
        OR: [
          {
            project: {
              creatorId: userId,
            },
          },
          {
            epic: {
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
          },
        ],
      },
    });

    if (!existingStory) {
      return NextResponse.json(
        { error: "Story를 찾을 수 없거나 권한이 없습니다" },
        { status: 404 }
      );
    }

    await prisma.story.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: "Story가 삭제되었습니다" });
  } catch (error) {
    console.error("Story 삭제 오류:", error);
    return NextResponse.json(
      { error: "Story 삭제에 실패했습니다" },
      { status: 500 }
    );
  }
}
