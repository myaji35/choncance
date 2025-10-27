import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/pm/export/epic/[id] - Epic을 마크다운으로 내보내기
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
      },
    });

    if (!epic) {
      return NextResponse.json(
        { error: "Epic을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 마크다운 생성
    let markdown = `# Epic ${epic.number}: ${epic.title}\n\n`;
    markdown += `**Goal:** ${epic.goal}\n\n`;
    markdown += `**Type:** ${epic.type}\n`;
    markdown += `**Status:** ${epic.status}\n\n`;

    if (epic.stories.length > 0) {
      markdown += `## Stories\n\n`;
      epic.stories.forEach((story) => {
        markdown += `### Story ${story.epicNumber}.${story.storyNumber}: ${story.title}\n\n`;
        markdown += `As a ${story.userType},\n`;
        markdown += `I want ${story.action},\n`;
        markdown += `so that ${story.benefit}.\n\n`;

        if (story.acceptanceCriteria.length > 0) {
          markdown += `**Acceptance Criteria:**\n\n`;
          story.acceptanceCriteria.forEach((ac) => {
            markdown += `${ac.number}. ${ac.criteria}\n`;
          });
          markdown += `\n`;
        }

        if (story.integrationVerification.length > 0) {
          markdown += `**Integration Verification:**\n\n`;
          story.integrationVerification.forEach((iv) => {
            markdown += `IV${iv.number}: ${iv.description}\n`;
          });
          markdown += `\n`;
        }
      });
    }

    return new NextResponse(markdown, {
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `attachment; filename="epic-${epic.number}-${epic.title}.md"`,
      },
    });
  } catch (error) {
    console.error("Epic 내보내기 오류:", error);
    return NextResponse.json(
      { error: "Epic 내보내기에 실패했습니다" },
      { status: 500 }
    );
  }
}
