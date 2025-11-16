import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/prisma";

// POST /api/pm/stories - 새 Story 생성
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
      epicId,
      epicNumber,
      storyNumber,
      title,
      userType,
      action,
      benefit,
      type,
      acceptanceCriteria,
      integrationVerification,
    } = body;

    if (
      !epicId ||
      epicNumber === undefined ||
      storyNumber === undefined ||
      !title ||
      !userType ||
      !action ||
      !benefit
    ) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다" },
        { status: 400 }
      );
    }

    // Epic 소유권 확인
    const epic = await prisma.epic.findFirst({
      where: {
        id: epicId,
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

    if (!epic) {
      return NextResponse.json(
        { error: "Epic을 찾을 수 없거나 권한이 없습니다" },
        { status: 404 }
      );
    }

    const story = await prisma.story.create({
      data: {
        epicId,
        epicNumber,
        storyNumber,
        title,
        userType,
        action,
        benefit,
        type: type || "greenfield",
        ...(epic.projectId && { projectId: epic.projectId }),
        ...(acceptanceCriteria && {
          acceptanceCriteria: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            create: acceptanceCriteria.map((ac: any, index: number) => ({
              number: index + 1,
              criteria: ac.criteria,
            })),
          },
        }),
        ...(integrationVerification && {
          integrationVerification: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            create: integrationVerification.map((iv: any, index: number) => ({
              number: index + 1,
              description: iv.description,
            })),
          },
        }),
      },
      include: {
        acceptanceCriteria: true,
        integrationVerification: true,
      },
    });

    return NextResponse.json({ story }, { status: 201 });
  } catch (error) {
    console.error("Story 생성 오류:", error);
    return NextResponse.json(
      { error: "Story 생성에 실패했습니다" },
      { status: 500 }
    );
  }
}
