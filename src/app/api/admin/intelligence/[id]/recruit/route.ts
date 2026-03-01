import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/intelligence/[id]/recruit — 리크루트 상태 변경
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { isRecruited, recruitNote } = body as {
    isRecruited: boolean;
    recruitNote?: string;
  };

  const updated = await prisma.propertyIntelligence.update({
    where: { id: params.id },
    data: {
      isRecruited,
      recruitNote: recruitNote ?? null,
      recruitedAt: isRecruited ? new Date() : null,
    },
    select: {
      id: true,
      name: true,
      isRecruited: true,
      recruitNote: true,
      recruitedAt: true,
    },
  });

  return NextResponse.json({ data: updated });
}
