import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const propertySchema = z.object({
  title: z.string().min(2, "숙소명은 2자 이상이어야 합니다").max(100),
  description: z.string().max(2000).optional(),
  location: z.string().min(2, "지역을 입력해주세요"),
  address: z.string().optional(),
  pricePerNight: z.number().int().min(0).optional(),
  maxGuests: z.number().int().min(1).max(20).default(4),
  phone: z.string().optional(),
  status: z.enum(["draft", "active"]).default("draft"),
});

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "HOST") {
    return Response.json({ error: "호스트만 숙소를 등록할 수 있습니다" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = propertySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요" },
      { status: 400 }
    );
  }

  const property = await prisma.property.create({
    data: { ...parsed.data, hostId: user.id },
  });

  return Response.json(
    { message: "숙소가 등록되었습니다", property },
    { status: 201 }
  );
}
