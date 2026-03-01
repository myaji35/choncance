import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/admin-auth";
import { z } from "zod";

const tagUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "태그명은 최소 2자 이상이어야 합니다")
    .max(20, "태그명은 최대 20자까지 가능합니다")
    .regex(/^#/, "태그명은 #으로 시작해야 합니다")
    .optional(),
  icon: z.string().optional(),
  description: z.string().max(100).optional(),
  category: z.enum(["VIEW", "ACTIVITY", "FACILITY", "VIBE"]).optional(),
  color: z.string().optional(),
});

// PATCH /api/admin/tags/[id] - Update tag
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminAuth();

    const body = await request.json();
    const parsed = tagUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "입력값이 유효하지 않습니다" },
        { status: 400 }
      );
    }

    const tag = await prisma.tag.findUnique({ where: { id: params.id } });
    if (!tag) {
      return NextResponse.json({ error: "태그를 찾을 수 없습니다" }, { status: 404 });
    }

    // Check name uniqueness if name is being changed
    if (parsed.data.name && parsed.data.name !== tag.name) {
      const existing = await prisma.tag.findUnique({ where: { name: parsed.data.name } });
      if (existing) {
        return NextResponse.json(
          { error: "이미 존재하는 태그명입니다" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.tag.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json({ tag: updated, message: "태그가 수정되었습니다" });
  } catch (error) {
    console.error("Failed to update tag:", error);
    return NextResponse.json({ error: "태그 수정 실패" }, { status: 500 });
  }
}

// DELETE /api/admin/tags/[id] - Delete tag (only if not in use)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminAuth();

    const tag = await prisma.tag.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { properties: true } },
      },
    });

    if (!tag) {
      return NextResponse.json({ error: "태그를 찾을 수 없습니다" }, { status: 404 });
    }

    if (tag._count.properties > 0) {
      return NextResponse.json(
        {
          error: `${tag._count.properties}개 숙소가 사용중인 태그는 삭제할 수 없습니다`,
        },
        { status: 409 }
      );
    }

    await prisma.tag.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "태그가 삭제되었습니다" });
  } catch (error) {
    console.error("Failed to delete tag:", error);
    return NextResponse.json({ error: "태그 삭제 실패" }, { status: 500 });
  }
}
