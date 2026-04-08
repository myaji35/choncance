import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { z } from "zod";

const registerSchema = z.object({
  email: z
    .string({ error: "이메일을 입력해주세요" })
    .min(1, "이메일을 입력해주세요")
    .email("올바른 이메일을 입력해주세요"),
  password: z
    .string({ error: "비밀번호를 입력해주세요" })
    .min(8, "비밀번호는 8자 이상이어야 합니다")
    .max(100, "비밀번호는 100자 이하여야 합니다"),
  name: z
    .string({ error: "이름을 입력해주세요" })
    .min(2, "이름은 2자 이상이어야 합니다")
    .max(20, "이름은 20자 이하여야 합니다"),
  role: z.enum(["GUEST", "HOST"]).default("GUEST"),
});

export async function POST(request: NextRequest) {
  // ISS-020: Rate limit — 가입 시도 IP당 5회/10분
  const ip = getClientIp(request);
  const rl = rateLimit(`register:${ip}`, 5, 10 * 60_000);
  if (!rl.allowed) {
    return Response.json(
      { error: "가입 시도가 너무 많습니다. 잠시 후 다시 시도해주세요" },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "요청 형식이 올바르지 않습니다" },
      { status: 400 }
    );
  }
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요" },
      { status: 400 }
    );
  }

  const { email, password, name, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json(
      { error: "이미 가입된 이메일입니다" },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name, role },
  });

  return Response.json(
    { message: "회원가입이 완료되었습니다", userId: user.id },
    { status: 201 }
  );
}
