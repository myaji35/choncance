import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/pm/projects/[id] - 특정 프로젝트 상세 조회
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

    const project = await prisma.pMProject.findUnique({
      where: {
        id: params.id,
        creatorId: userId,
      },
      include: {
        prds: {
          include: {
            requirements: true,
            epics: {
              include: {
                stories: {
                  include: {
                    acceptanceCriteria: true,
                    integrationVerification: true,
                  },
                },
              },
            },
          },
        },
        epics: {
          include: {
            stories: {
              include: {
                acceptanceCriteria: true,
                integrationVerification: true,
              },
            },
          },
        },
        stories: {
          include: {
            acceptanceCriteria: true,
            integrationVerification: true,
          },
        },
        changeLogs: {
          orderBy: {
            date: "desc",
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "프로젝트를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("프로젝트 조회 오류:", error);
    return NextResponse.json(
      { error: "프로젝트 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}

// PATCH /api/pm/projects/[id] - 프로젝트 수정
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
    const { name, description } = body;

    // 프로젝트 소유권 확인
    const existingProject = await prisma.pMProject.findUnique({
      where: {
        id: params.id,
        creatorId: userId,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: "프로젝트를 찾을 수 없거나 권한이 없습니다" },
        { status: 404 }
      );
    }

    const project = await prisma.pMProject.update({
      where: {
        id: params.id,
      },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error("프로젝트 수정 오류:", error);
    return NextResponse.json(
      { error: "프로젝트 수정에 실패했습니다" },
      { status: 500 }
    );
  }
}

// DELETE /api/pm/projects/[id] - 프로젝트 삭제
export async function DELETE(
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

    // 프로젝트 소유권 확인
    const existingProject = await prisma.pMProject.findUnique({
      where: {
        id: params.id,
        creatorId: userId,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: "프로젝트를 찾을 수 없거나 권한이 없습니다" },
        { status: 404 }
      );
    }

    await prisma.pMProject.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: "프로젝트가 삭제되었습니다" });
  } catch (error) {
    console.error("프로젝트 삭제 오류:", error);
    return NextResponse.json(
      { error: "프로젝트 삭제에 실패했습니다" },
      { status: 500 }
    );
  }
}
