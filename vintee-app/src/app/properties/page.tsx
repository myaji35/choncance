import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRating } from "@/lib/utils/review";
import SearchFilter from "./SearchFilter";
import ViewToggle from "./ViewToggle";
import PropertiesMap from "@/components/map/PropertiesMap";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "숙소 찾기 | VINTEE",
  description: "논뷰 한옥, 산골 펜션, 바다 근처 민박까지 — VINTEE에서 특별한 촌캉스 숙소를 찾아보세요.",
};

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const sp = await searchParams;
  const q = sp.q || "";
  const location = sp.location || "";
  const minPrice = sp.minPrice ? Number(sp.minPrice) : undefined;
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : undefined;
  const guests = sp.guests ? Number(sp.guests) : undefined;
  const view: "list" | "map" = sp.view === "map" ? "map" : "list";

  // Prisma where 조건 조합
  const where: Record<string, unknown> = { status: "active" };

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
    ];
  }
  if (location) {
    where.location = { contains: location };
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.pricePerNight = {
      ...(minPrice !== undefined ? { gte: minPrice } : {}),
      ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
    };
  }
  if (guests) {
    where.maxGuests = { gte: guests };
  }

  const properties = await prisma.property.findMany({
    where: where as Parameters<typeof prisma.property.findMany>[0] extends { where?: infer W } ? W : never,
    include: {
      host: { select: { name: true } },
      reviews: { select: { rating: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // 지역 목록 (필터 옵션용)
  const allLocations = await prisma.property.findMany({
    where: { status: "active" },
    select: { location: true },
    distinct: ["location"],
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
    <div className="mx-auto max-w-5xl px-4 py-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#00A1E0]">
        Find Your Country Stay
      </p>
      <h1 className="mt-1 text-2xl font-bold text-[#16325C]">숙소 찾기</h1>

      {/* 검색/필터 */}
      <SearchFilter
        locations={allLocations.map((l) => l.location)}
        initialValues={{ q, location, minPrice: sp.minPrice || "", maxPrice: sp.maxPrice || "", guests: sp.guests || "" }}
      />

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {properties.length}개의 숙소
          {q && <span> · &quot;{q}&quot; 검색 결과</span>}
        </p>
        <ViewToggle view={view} />
      </div>

      {/* ISS-022: AI 재정렬 진입 — 검색어 있을 때만 노출 */}
      {q && (
        <div className="mt-3 rounded-2xl border border-[#4A6741]/20 bg-[#F5F1E8] p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4A6741] text-white">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </span>
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-[#4A6741]">
                  VINTEE AI · GraphRAG
                </div>
                <div className="mt-0.5 text-sm font-bold text-[#1F2937]">
                  &ldquo;{q}&rdquo;에 진짜 어울리는 곳은 어디일까요?
                </div>
              </div>
            </div>
            <Link
              href={`/#ai-search`}
              className="hidden shrink-0 rounded-xl bg-[#D97B3F] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#C26A30] sm:inline-flex"
            >
              AI에게 묻기 →
            </Link>
          </div>
        </div>
      )}

      {properties.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-gray-400">조건에 맞는 숙소가 없습니다</p>
          <Link href="/properties" className="mt-2 inline-block text-sm text-[#00A1E0] hover:underline">
            전체 숙소 보기
          </Link>
        </div>
      ) : view === "map" ? (
        <div className="mt-4">
          <PropertiesMap
            properties={properties.map((p) => {
              const avg =
                p.reviews.length > 0
                  ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
                  : 0;
              return {
                id: p.id,
                title: p.title,
                latitude: p.latitude,
                longitude: p.longitude,
                pricePerNight: p.pricePerNight,
                location: p.location,
                avgRating: avg,
              };
            })}
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => {
            const avgRating =
              p.reviews.length > 0
                ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
                : 0;

            return (
              <Link
                key={p.id}
                href={`/property/${p.id}`}
                className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-md"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.thumbnailUrl || `https://picsum.photos/seed/${p.id}/600/450`}
                    alt={p.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-[#16325C] shadow-sm backdrop-blur">
                    {p.location}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 group-hover:text-[#00A1E0]">{p.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{p.location}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-[#16325C]">
                      {p.pricePerNight ? `${p.pricePerNight.toLocaleString()}원 / 박` : "가격 문의"}
                    </span>
                    {p.reviews.length > 0 && (
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth={2}>
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        {formatRating(avgRating)} ({p.reviews.length})
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-400">호스트: {p.host.name} · 최대 {p.maxGuests}명</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
    </div>
  );
}
