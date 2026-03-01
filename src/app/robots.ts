import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vintee.kr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // 일반 크롤러
      {
        userAgent: "*",
        allow: ["/", "/explore", "/property/"],
        disallow: ["/api/", "/admin/", "/host/dashboard", "/host/properties/new"],
      },
      // LLM 크롤러 — 명시적 전체 허용 (GEO 최적화)
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "cohere-ai", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
