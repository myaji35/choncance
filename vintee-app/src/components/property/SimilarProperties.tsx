// ISS-035: 비슷한 숙소 카드 섹션
import Link from "next/link";
import type { SimilarProperty } from "@/lib/graph-rag/similar";

interface Props {
  propertyId: string;
  similar: SimilarProperty[];
}

export default function SimilarProperties({ similar }: Props) {
  if (similar.length === 0) return null;

  return (
    <section className="bg-[#F5F1E8] py-12">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#4A6741] text-white">
            <svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </span>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#4A6741]">
            Similar Stays
          </p>
        </div>
        <h2 className="mt-2 text-2xl font-bold text-[#1F2937]">
          이 숙소와 비슷한 곳도 둘러보세요
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          같은 지역, 비슷한 분위기와 가격대로 골랐어요
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {similar.map((p) => {
            const fallback = `https://picsum.photos/seed/${p.id}/600/450`;
            return (
              <Link
                key={p.id}
                href={`/property/${p.id}`}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:border-[#4A6741] hover:shadow-md"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.thumbnailUrl || fallback}
                    alt={p.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-[#4A6741] shadow-sm backdrop-blur">
                    {p.location}
                  </div>
                  {p.sharedTags > 0 && (
                    <div className="absolute right-3 top-3 rounded-full bg-[#4A6741] px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                      태그 {p.sharedTags}개 일치
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-1 font-bold text-gray-900 group-hover:text-[#4A6741]">
                    {p.title}
                  </h3>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="font-bold text-[#1F2937]">
                      {p.pricePerNight
                        ? `${p.pricePerNight.toLocaleString()}원`
                        : "가격 문의"}
                      <span className="text-xs font-normal text-gray-400"> / 박</span>
                    </span>
                    {p.reviewCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-600">
                        <svg
                          width={12}
                          height={12}
                          viewBox="0 0 24 24"
                          fill="#D97B3F"
                          stroke="#D97B3F"
                          strokeWidth={2}
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <span className="font-semibold">{p.avgRating.toFixed(1)}</span>
                        <span className="text-gray-400">({p.reviewCount})</span>
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
