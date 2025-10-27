import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/pm/export/prd/[id] - PRD를 마크다운으로 내보내기
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
      },
    });

    if (!prd) {
      return NextResponse.json(
        { error: "PRD를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 마크다운 생성
    let markdown = `# ${prd.title}\n\n`;

    // Goals and Background
    markdown += `## Goals and Background Context\n\n`;
    markdown += `### Goals\n\n`;
    const goals = Array.isArray(prd.goals) ? prd.goals : [];
    goals.forEach((goal: string) => {
      markdown += `- ${goal}\n`;
    });
    markdown += `\n### Background Context\n\n${prd.background}\n\n`;

    // Change Log
    if (prd.changeLogs.length > 0) {
      markdown += `### Change Log\n\n`;
      markdown += `| Date | Version | Description | Author |\n`;
      markdown += `|------|---------|-------------|--------|\n`;
      prd.changeLogs.forEach((log) => {
        markdown += `| ${log.date.toISOString().split('T')[0]} | ${log.version} | ${log.description} | ${log.author} |\n`;
      });
      markdown += `\n`;
    }

    // Requirements
    markdown += `## Requirements\n\n`;

    const functional = prd.requirements.filter((r) => r.type === "functional");
    const nonFunctional = prd.requirements.filter((r) => r.type === "non-functional");
    const compatibility = prd.requirements.filter((r) => r.type === "compatibility");

    if (functional.length > 0) {
      markdown += `### Functional Requirements\n\n`;
      functional.forEach((req) => {
        markdown += `${req.prefix}${req.number}: ${req.description}\n\n`;
      });
    }

    if (nonFunctional.length > 0) {
      markdown += `### Non-Functional Requirements\n\n`;
      nonFunctional.forEach((req) => {
        markdown += `${req.prefix}${req.number}: ${req.description}\n\n`;
      });
    }

    if (compatibility.length > 0) {
      markdown += `### Compatibility Requirements\n\n`;
      compatibility.forEach((req) => {
        markdown += `${req.prefix}${req.number}: ${req.description}\n\n`;
      });
    }

    // UI Goals
    if (prd.uiGoals) {
      markdown += `## User Interface Design Goals\n\n`;
      markdown += `${JSON.stringify(prd.uiGoals, null, 2)}\n\n`;
    }

    // Technical Assumptions
    if (prd.technicalAssum) {
      markdown += `## Technical Assumptions\n\n`;
      markdown += `${JSON.stringify(prd.technicalAssum, null, 2)}\n\n`;
    }

    // Epics
    if (prd.epics.length > 0) {
      markdown += `## Epics\n\n`;
      prd.epics.forEach((epic) => {
        markdown += `### Epic ${epic.number}: ${epic.title}\n\n`;
        markdown += `**Goal:** ${epic.goal}\n\n`;

        if (epic.stories.length > 0) {
          markdown += `#### Stories\n\n`;
          epic.stories.forEach((story) => {
            markdown += `##### Story ${story.epicNumber}.${story.storyNumber}: ${story.title}\n\n`;
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
      });
    }

    return new NextResponse(markdown, {
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `attachment; filename="${prd.title}.md"`,
      },
    });
  } catch (error) {
    console.error("PRD 내보내기 오류:", error);
    return NextResponse.json(
      { error: "PRD 내보내기에 실패했습니다" },
      { status: 500 }
    );
  }
}
