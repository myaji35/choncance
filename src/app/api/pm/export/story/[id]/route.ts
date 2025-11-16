import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/prisma";

// GET /api/pm/export/story/[id] - Story를 마크다운으로 내보내기
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
      },
    });

    if (!story) {
      return NextResponse.json(
        { error: "Story를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 마크다운 생성
    let markdown = `# Story ${story.epicNumber}.${story.storyNumber}: ${story.title}\n\n`;
    markdown += `**Epic:** ${story.epic.title}\n\n`;
    markdown += `**Type:** ${story.type}\n`;
    markdown += `**Status:** ${story.status}\n\n`;

    markdown += `## User Story\n\n`;
    markdown += `As a ${story.userType},\n`;
    markdown += `I want ${story.action},\n`;
    markdown += `so that ${story.benefit}.\n\n`;

    if (story.acceptanceCriteria.length > 0) {
      markdown += `## Acceptance Criteria\n\n`;
      story.acceptanceCriteria.forEach((ac) => {
        markdown += `${ac.number}. ${ac.criteria}\n`;
      });
      markdown += `\n`;
    }

    if (story.integrationVerification.length > 0) {
      markdown += `## Integration Verification\n\n`;
      story.integrationVerification.forEach((iv) => {
        markdown += `IV${iv.number}: ${iv.description}\n`;
      });
      markdown += `\n`;
    }

    return new NextResponse(markdown, {
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `attachment; filename="story-${story.epicNumber}.${story.storyNumber}-${story.title}.md"`,
      },
    });
  } catch (error) {
    console.error("Story 내보내기 오류:", error);
    return NextResponse.json(
      { error: "Story 내보내기에 실패했습니다" },
      { status: 500 }
    );
  }
}
