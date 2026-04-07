import { NextRequest } from "next/server";
import { recommend } from "@/lib/graph-rag/recommend";
import { z } from "zod";

const querySchema = z.object({
  q: z.string().min(2).max(200),
});

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("q");
  const parsed = querySchema.safeParse({ q: raw });
  if (!parsed.success) {
    return Response.json({ error: "쿼리가 필요합니다 (2~200자)" }, { status: 400 });
  }

  try {
    const results = await recommend(parsed.data.q);
    return Response.json({ query: parsed.data.q, results });
  } catch (err) {
    console.error("[/api/recommend]", err);
    return Response.json({ error: "추천 엔진 오류" }, { status: 500 });
  }
}
