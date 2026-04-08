// ISS-024: 이미지 업로드 엔드포인트 (호스트 전용)
// ISS-039: Vision 자동 태깅 통합
import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { uploadImage } from "@/lib/storage";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { suggestTagsFromImage } from "@/lib/vision-tag";
import { TAG_SEEDS } from "@/lib/graph-rag/tag-taxonomy";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }
  if (user.role !== "HOST" && user.role !== "ADMIN") {
    return Response.json({ error: "호스트만 이미지를 업로드할 수 있습니다" }, { status: 403 });
  }

  // Rate limit: 호스트 IP당 30 업로드/10분
  const ip = getClientIp(request);
  const rl = rateLimit(`upload:${ip}`, 30, 10 * 60_000);
  if (!rl.allowed) {
    return Response.json(
      { error: "업로드가 너무 많습니다. 잠시 후 다시 시도해주세요" },
      { status: 429 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "파일이 필요합니다" }, { status: 400 });
  }

  try {
    const result = await uploadImage(file, "properties");

    // ISS-039: Vision 자동 태깅 (외부 URL일 때만 시도, dev fallback에선 skip)
    let suggestedTags: { slug: string; name: string; type: string }[] = [];
    try {
      const slugs = await suggestTagsFromImage(result.url);
      const slugMap = new Map(TAG_SEEDS.map((t) => [t.slug, t]));
      suggestedTags = slugs
        .map((s) => slugMap.get(s))
        .filter((t): t is NonNullable<typeof t> => !!t)
        .map((t) => ({ slug: t.slug, name: t.name, type: t.type }));
    } catch (err) {
      console.error("[upload] vision tagging failed:", err);
    }

    return Response.json(
      { url: result.url, size: result.size, suggestedTags },
      { status: 201 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "업로드 실패";
    return Response.json({ error: msg }, { status: 400 });
  }
}
