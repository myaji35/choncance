// ISS-037: 호스트 SEO 제안 API
import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { suggestSeo } from "@/lib/seo-suggest";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { z } from "zod";

const inputSchema = z.object({
  title: z.string().max(200),
  description: z.string().max(3000),
  location: z.string().max(100),
  highlights: z.array(z.string().max(50)).max(20).optional(),
  hostIntro: z.string().max(2000).optional(),
  uniqueExperience: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "HOST" && user.role !== "ADMIN")) {
    return Response.json(
      { error: "호스트만 SEO 제안을 받을 수 있습니다" },
      { status: 403 }
    );
  }

  // Rate limit: 호스트 IP 10/10분 (LLM 비용 가드)
  const ip = getClientIp(request);
  const rl = rateLimit(`seo-suggest:${ip}`, 10, 10 * 60_000);
  if (!rl.allowed) {
    return Response.json(
      { error: "AI 다듬기 요청이 너무 많아요. 잠시 후 다시 시도해주세요" },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "요청 형식이 올바르지 않습니다" }, { status: 400 });
  }
  const parsed = inputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요" },
      { status: 400 }
    );
  }

  const suggestion = await suggestSeo(parsed.data);
  if (!suggestion) {
    return Response.json(
      { error: "AI 다듬기를 사용할 수 없어요. (OPENAI_API_KEY 미설정 또는 응답 오류)" },
      { status: 503 }
    );
  }
  return Response.json({ suggestion });
}
