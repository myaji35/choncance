// ISS-026: 페이지 조회 트래킹 비콘 엔드포인트
// 클라이언트가 navigator.sendBeacon 또는 fetch로 호출
import { NextRequest } from "next/server";
import { recordPropertyView, type ViewSource } from "@/lib/analytics";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // 분석 비콘은 abuse 방지: IP 기준 60/min
  const ip = getClientIp(request);
  const rl = rateLimit(`track:${ip}`, 60, 60_000);
  if (!rl.allowed) {
    return Response.json({ ok: false }, { status: 429 });
  }

  let body: { propertyId?: string; source?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  if (!body.propertyId || typeof body.propertyId !== "string") {
    return Response.json({ ok: false }, { status: 400 });
  }
  const allowed: ViewSource[] = ["page", "recommend", "list"];
  const source = (allowed.includes(body.source as ViewSource) ? body.source : "page") as ViewSource;

  await recordPropertyView({ propertyId: body.propertyId, source });
  return Response.json({ ok: true });
}
