import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRating } from "@/lib/utils/review";
import { parseJsonArray } from "@/lib/utils/geo";
import AiSearchBox from "./AiSearchBox";

export const dynamic = "force-dynamic";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1601762603339-fd61e28b698a?w=1920&q=80&auto=format&fit=crop";

const REGIONS = [
  { key: "충남", label: "충청", emoji: "한옥", hint: "고즈넉한 전통", image: "https://images.unsplash.com/photo-1601762603339-fd61e28b698a?w=600&q=80&auto=format&fit=crop" },
  { key: "강원", label: "강원", emoji: "산골", hint: "깊은 산과 별", image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=600&q=80&auto=format&fit=crop" },
  { key: "경남", label: "남해", emoji: "바다", hint: "바다와 섬", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80&auto=format&fit=crop" },
  { key: "제주", label: "제주", emoji: "섬", hint: "감귤과 오름", image: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=600&q=80&auto=format&fit=crop" },
  { key: "전남", label: "호남", emoji: "대숲", hint: "대숲과 차밭", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80&auto=format&fit=crop" },
];

const THEMES = [
  { label: "논뷰 한옥", q: "한옥" },
  { label: "산골 오두막", q: "산골" },
  { label: "바다 근처", q: "바다" },
  { label: "농장 체험", q: "농장" },
  { label: "글램핑", q: "글램핑" },
  { label: "반려동물 가능", q: "반려" },
];

export default async function HomePage() {
  const [properties, latestReviews] = await Promise.all([
    prisma.property.findMany({
      where: { status: "active" },
      include: {
        host: { select: { name: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.review.findMany({
      where: { rating: { gte: 4 } },
      include: {
        user: { select: { name: true } },
        property: { select: { id: true, title: true, location: true, thumbnailUrl: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <div className="bg-[#FAF8F5]">
      {/* ─── 히어로 ─── */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_IMAGE}
            alt="한국의 촌캉스"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#16325C]/70 via-[#16325C]/55 to-[#16325C]/85" />
        </div>

        <div className="mx-auto max-w-5xl px-4 pb-20 pt-24 text-white md:pb-28 md:pt-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
            한국 시골 · 한옥 · 농장 · 글램핑 큐레이션
          </div>
          <h1 className="mt-5 text-4xl font-bold leading-[1.15] md:text-5xl lg:text-6xl">
            오늘은 도시를 떠나,
            <br />
            <span className="text-[#F3C969]">촌캉스</span>로 떠나요.
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/80 md:text-lg">
            논뷰 한옥부터 산골 오두막, 바닷가 민박까지 —<br />
            한국의 사계절이 머무는 숙소를 VINTEE가 엄선했어요.
          </p>

          {/* AI 자연어 검색 — 히어로 직속 진입점 (0.5초 룰) */}
          <a
            href="#ai-search"
            className="mt-8 flex items-center gap-3 rounded-2xl bg-white/95 p-4 shadow-2xl backdrop-blur transition hover:shadow-[0_20px_60px_rgba(74,103,65,0.35)] sm:p-5"
          >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#4A6741] text-white shadow-md">
              <svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </span>
            <div className="flex-1 text-left">
              <div className="text-xs font-semibold uppercase tracking-widest text-[#4A6741]">
                VINTEE AI · GraphRAG
              </div>
              <div className="mt-0.5 text-sm font-bold text-[#1F2937] sm:text-base">
                &ldquo;가족이랑 가을에 조용한 한옥&rdquo; 처럼 말로 찾아보세요
              </div>
            </div>
            <span className="hidden shrink-0 rounded-xl bg-[#D97B3F] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#C26A30] sm:inline-flex">
              AI에게 묻기 →
            </span>
          </a>

          {/* 테마 칩 */}
          <div className="mt-5 flex flex-wrap gap-2">
            {THEMES.map((t) => (
              <Link
                key={t.label}
                href={`/properties?q=${encodeURIComponent(t.q)}`}
                className="rounded-full border border-white/40 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-white hover:text-[#16325C]"
              >
                #{t.label}
              </Link>
            ))}
          </div>

          {/* KPI */}
          <div className="mt-10 grid max-w-md grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-[#F3C969]">{properties.length}+</div>
              <div className="mt-0.5 text-xs text-white/70">엄선 숙소</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#F3C969]">5</div>
              <div className="mt-0.5 text-xs text-white/70">시골 권역</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#F3C969]">4.8</div>
              <div className="mt-0.5 text-xs text-white/70">평균 별점</div>
            </div>
          </div>
        </div>

        {/* 하단 물결 */}
        <svg
          className="absolute bottom-0 left-0 w-full text-[#FAF8F5]"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M0,40 C240,80 480,0 720,20 C960,40 1200,80 1440,40 L1440,60 L0,60 Z" />
        </svg>
      </section>

      {/* ─── AI 자연어 검색 (GraphRAG) ─── */}
      <AiSearchBox />

      {/* ─── 지역 큐레이션 ─── */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#00A1E0]">
              Region Curation
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#16325C]">권역별 촌캉스</h2>
          </div>
          <Link
            href="/properties"
            className="rounded-full border border-[#4A6741] bg-white px-4 py-1.5 text-sm font-semibold text-[#4A6741] transition hover:bg-[#4A6741] hover:text-white"
          >
            전체 지역 →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          {REGIONS.map((r) => (
            <Link
              key={r.key}
              href={`/properties?location=${encodeURIComponent(r.key)}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-gray-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={r.image}
                alt={r.label}
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#16325C]/85 via-[#16325C]/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 text-white">
                <div className="text-xs text-[#F3C969]">{r.emoji}</div>
                <div className="mt-0.5 text-lg font-bold">{r.label}</div>
                <div className="mt-0.5 text-xs text-white/80">{r.hint}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── 추천 숙소 ─── */}
      <section className="mx-auto max-w-5xl px-4 py-4 pb-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#00A1E0]">
              Editor&apos;s Pick
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#16325C]">이번 주 추천 숙소</h2>
          </div>
          <Link
            href="/properties"
            className="rounded-full border border-[#4A6741] bg-white px-4 py-1.5 text-sm font-semibold text-[#4A6741] transition hover:bg-[#4A6741] hover:text-white"
          >
            전체 보기 →
          </Link>
        </div>

        {properties.length === 0 ? (
          <p className="mt-8 text-center text-gray-400">등록된 숙소가 없습니다</p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => {
              const avgRating =
                p.reviews.length > 0
                  ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
                  : 0;
              const highlights = parseJsonArray<string>(p.highlights).slice(0, 2);
              const fallback = `https://picsum.photos/seed/${p.id}/600/450`;

              return (
                <Link
                  key={p.id}
                  href={`/property/${p.id}`}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.thumbnailUrl || fallback}
                      alt={p.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-[#16325C] shadow-sm backdrop-blur">
                      {p.location}
                    </div>
                    {p.petsAllowed && (
                      <div className="absolute right-3 top-3 rounded-full bg-[#F59E0B] px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                        반려동물 OK
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 group-hover:text-[#00A1E0]">
                      {p.title}
                    </h3>
                    {highlights.length > 0 && (
                      <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                        {highlights.map((h) => `· ${h}`).join(" ")}
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-[#16325C]">
                        {p.pricePerNight
                          ? `${p.pricePerNight.toLocaleString()}원`
                          : "가격 문의"}
                        <span className="text-xs font-normal text-gray-400"> / 박</span>
                      </span>
                      {p.reviews.length > 0 && (
                        <span className="flex items-center gap-1 text-sm text-gray-600">
                          <svg
                            width={14}
                            height={14}
                            viewBox="0 0 24 24"
                            fill="#F59E0B"
                            stroke="#F59E0B"
                            strokeWidth={2}
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          <span className="font-semibold">{formatRating(avgRating)}</span>
                          <span className="text-gray-400">({p.reviews.length})</span>
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      호스트 {p.host.name} · 최대 {p.maxGuests}명
                    </p>
                    {p.hostIntro && (
                      <p className="mt-2 line-clamp-2 border-l-2 border-[#4A6741]/40 pl-2 text-xs italic text-gray-600">
                        &ldquo;{p.hostIntro}&rdquo;
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── 최근 후기 ─── */}
      {latestReviews.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-5xl px-4">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#00A1E0]">
                Real Stories
              </p>
              <h2 className="mt-1 text-2xl font-bold text-[#16325C]">
                다녀온 분들의 이야기
              </h2>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {latestReviews.map((r) => {
                const initial = r.user.name.charAt(0);
                return (
                  <Link
                    key={r.id}
                    href={`/property/${r.property.id}`}
                    className="group rounded-2xl border border-gray-200 bg-[#FAF8F5] p-5 transition hover:border-[#00A1E0] hover:shadow-md"
                  >
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          width={14}
                          height={14}
                          viewBox="0 0 24 24"
                          fill={i < r.rating ? "#F59E0B" : "none"}
                          stroke="#F59E0B"
                          strokeWidth={2}
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                    <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-gray-700">
                      &ldquo;{r.content}&rdquo;
                    </p>
                    <div className="mt-4 flex items-center gap-3 border-t border-gray-200 pt-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00A1E0] text-sm font-bold text-white">
                        {initial}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-[#16325C] group-hover:text-[#00A1E0]">
                          {r.property.title}
                        </div>
                        <div className="text-xs text-gray-500">{r.property.location}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── 호스트 모집 CTA ─── */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#16325C] via-[#1E4575] to-[#00A1E0] p-8 text-white md:p-12">
          <div className="relative z-10 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#F3C969]">
              For Hosts
            </p>
            <h2 className="mt-2 text-2xl font-bold md:text-3xl">
              당신의 시골집을
              <br />
              여행의 중심으로
            </h2>
            <p className="mt-3 text-sm text-white/80">
              별도 수수료 없이 직접 예약을 받고, VINTEE의 AI 검색 노출 최적화로 더 많은 게스트를 만나보세요.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#16325C] transition hover:bg-[#F3C969]"
              >
                호스트 가입하기
              </Link>
              <Link
                href="/host/geo"
                className="rounded-xl border border-white/40 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                GEO 점수 보기
              </Link>
            </div>
          </div>
          {/* 장식 원 */}
          <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-[#F3C969]/20 blur-3xl" />
        </div>
      </section>
    </div>
  );
}
