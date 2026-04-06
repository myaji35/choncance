import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRating } from "@/lib/utils/review";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const properties = await prisma.property.findMany({
    where: { status: "active" },
    include: {
      host: { select: { name: true } },
      reviews: { select: { rating: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <div>
      {/* 히어로 */}
      <section className="bg-[#16325C] px-4 py-16 text-center text-white">
        <h1 className="text-3xl font-bold md:text-4xl">
          특별한 농촌 휴가,
          <br />
          VINTEE에서 시작하세요
        </h1>
        <p className="mt-3 text-white/70">
          논뷰 한옥, 산골 펜션, 바다 근처 민박까지 — 촌캉스의 모든 것
        </p>
        <Link
          href="/properties"
          className="mt-6 inline-block rounded-lg bg-[#00A1E0] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0090C7]"
        >
          숙소 둘러보기
        </Link>
      </section>

      {/* 추천 숙소 */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#16325C]">추천 숙소</h2>
          <Link href="/properties" className="text-sm text-[#00A1E0] hover:underline">
            전체 보기
          </Link>
        </div>

        {properties.length === 0 ? (
          <p className="mt-8 text-center text-gray-400">등록된 숙소가 없습니다</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
