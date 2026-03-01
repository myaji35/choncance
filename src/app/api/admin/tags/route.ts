import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/admin-auth";
import { z } from "zod";

const tagSchema = z.object({
  name: z
    .string()
    .min(2, "태그명은 최소 2자 이상이어야 합니다")
    .max(20, "태그명은 최대 20자까지 가능합니다")
    .regex(/^#/, "태그명은 #으로 시작해야 합니다"),
  icon: z.string().optional(),
  description: z.string().max(100).optional(),
  category: z.enum(["VIEW", "ACTIVITY", "FACILITY", "VIBE"]),
  color: z.string().optional(),
});

// GET /api/admin/tags - List all tags with usage count
export async function GET() {
  try {
    await requireAdminAuth();

    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { properties: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    return NextResponse.json({ error: "태그 목록 조회 실패" }, { status: 500 });
  }
}

// POST /api/admin/tags - Create new tag
export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth();

    const body = await request.json();
    const parsed = tagSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "입력값이 유효하지 않습니다" },
        { status: 400 }
      );
    }

    const { name, icon, description, category, color } = parsed.data;

    // Check uniqueness
    const existing = await prisma.tag.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json(
        { error: "이미 존재하는 태그명입니다" },
        { status: 400 }
      );
    }

    const tag = await prisma.tag.create({
      data: { name, icon, description, category, color },
    });

    return NextResponse.json({ tag, message: "태그가 생성되었습니다" }, { status: 201 });
  } catch (error) {
    console.error("Failed to create tag:", error);
    return NextResponse.json({ error: "태그 생성 실패" }, { status: 500 });
  }
}
