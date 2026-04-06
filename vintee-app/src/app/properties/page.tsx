import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRating } from "@/lib/utils/review";
import SearchFilter from "./SearchFilter";

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
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-xl font-bold text-[#16325C]">숙소 찾기</h1>

      {/* 검색/필터 */}
      <SearchFilter
        locations={allLocations.map((l) => l.location)}
        initialValues={{ q, location, minPrice: sp.minPrice || "", maxPrice: sp.maxPrice || "", guests: sp.guests || "" }}
      />

      <p className="mt-4 text-sm text-gray-500">
        {properties.length}개의 숙소
        {q && <span> · &quot;{q}&quot; 검색 결과</span>}
      </p>

      {properties.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-gray-400">조건에 맞는 숙소가 없습니다</p>
          <Link href="/properties" className="mt-2 inline-block text-sm text-[#00A1E0] hover:underline">
            전체 숙소 보기
          </Link>
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
                <div className="aspect-[4/3] bg-gray-100">
                  {p.thumbnailUrl ? (
                    <img src={p.thumbnailUrl} alt={p.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-300">
                      <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  )}
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
  );
}
