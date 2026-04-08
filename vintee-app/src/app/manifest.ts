import type { MetadataRoute } from "next";

// ISS-016: PWA manifest — brand-dna 컬러 적용
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VINTEE — 한국형 촌캉스 큐레이션",
    short_name: "VINTEE",
    description: "느낌만 말해도 딱 맞는 한국 시골·한옥·농장·글램핑을 AI가 골라줍니다",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F1E8",
    theme_color: "#4A6741",
    orientation: "portrait-primary",
    lang: "ko-KR",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
    categories: ["travel", "lifestyle"],
  };
}
