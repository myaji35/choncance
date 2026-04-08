// ISS-026: 호스트 인사이트 대시보드
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getHostInsights, getHostTopQueries } from "@/lib/analytics";

export default async function HostInsightsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "HOST" && user.role !== "ADMIN")) redirect("/");

  const [insights, topQueries] = await Promise.all([
    getHostInsights(user.id),
    getHostTopQueries(user.id, 5),
  ]);

  // 숙소 합계
  const totals = insights.reduce(
    (acc, i) => ({
      views: acc.views + i.totalViews30d,
      bookings: acc.bookings + i.totalBookings,
      reviews: acc.reviews + i.reviewCount,
      recommendViews: acc.recommendViews + i.bySource.recommend,
    }),
    { views: 0, bookings: 0, reviews: 0, recommendViews: 0 }
  );

  const overallConversion =
    totals.views > 0 ? Math.round((totals.bookings / totals.views) * 1000) / 10 : 0;

  return (
    <div className="bg-[#F5F1E8] py-10">
      <div className="mx-auto max-w-5xl px-4">
        {/* 헤더 */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#4A6741]">
              Insights · 최근 30일
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#1F2937]">
              내 숙소가 어떻게 보이고 있을까요?
            </h1>
          </div>
          <Link
            href="/host"
            className="text-sm text-[#4A6741] hover:underline"
          >
            ← 대시보드로
          </Link>
        </div>

        {/* 합계 카드 4개 */}
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-[#4A6741]/20 bg-white p-5">
            <p className="text-xs font-semibold text-gray-500">총 노출</p>
            <p className="mt-1 text-3xl font-bold text-[#4A6741]">{totals.views}</p>
            <p className="mt-1 text-xs text-gray-400">최근 30일 페이지 조회</p>
          </div>
          <div className="rounded-2xl border border-[#4A6741]/20 bg-white p-5">
            <p className="text-xs font-semibold text-gray-500">AI 추천 등장</p>
            <p className="mt-1 text-3xl font-bold text-[#D97B3F]">
              {totals.recommendViews}
            </p>
            <p className="mt-1 text-xs text-gray-400">GraphRAG가 추천한 횟수</p>
          </div>
          <div className="rounded-2xl border border-[#4A6741]/20 bg-white p-5">
            <p className="text-xs font-semibold text-gray-500">예약 전환율</p>
            <p className="mt-1 text-3xl font-bold text-[#1F2937]">
              {overallConversion}%
            </p>
            <p className="mt-1 text-xs text-gray-400">{totals.bookings}건 / {totals.views}회</p>
          </div>
          <div className="rounded-2xl border border-[#4A6741]/20 bg-white p-5">
            <p className="text-xs font-semibold text-gray-500">받은 후기</p>
            <p className="mt-1 text-3xl font-bold text-[#1F2937]">{totals.reviews}</p>
            <p className="mt-1 text-xs text-gray-400">누적</p>
          </div>
        </div>

        {/* ISS-033: 내 숙소가 매칭된 top 쿼리 */}
        {topQueries.length > 0 && (
          <div className="mt-8 rounded-2xl border border-[#4A6741]/20 bg-white p-5">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#4A6741] text-white">
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </span>
              <h2 className="text-lg font-bold text-[#1F2937]">
                AI 추천에서 자주 매칭된 쿼리
              </h2>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              사용자가 이런 자연어로 검색했을 때 내 숙소가 추천되었어요
            </p>
            <div className="mt-4 space-y-2">
              {topQueries.map((q) => (
                <div
                  key={q.query}
                  className="flex items-center justify-between gap-3 rounded-lg bg-[#F5F1E8] px-4 py-3"
                >
                  <span className="flex-1 text-sm text-[#1F2937]">
                    &ldquo;{q.query}&rdquo;
                  </span>
                  <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-[#4A6741]">
                    {q.count}회
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold text-white ${
                      q.bestRank === 1
                        ? "bg-[#D97B3F]"
                        : q.bestRank <= 3
                        ? "bg-[#4A6741]"
                        : "bg-gray-400"
                    }`}
                    title="가장 높았던 추천 순위"
                  >
                    #{q.bestRank}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 rounded-lg border-l-2 border-[#D97B3F] bg-[#F5F1E8]/50 px-3 py-2 text-xs text-gray-700">
              <strong className="text-[#D97B3F]">VINTEE 코칭 · </strong>
              위 쿼리에 더 잘 노출되려면 호스트 한마디·하이라이트·근처 명소를 풍성하게 채워보세요.
            </p>
          </div>
        )}

        {/* 숙소별 인사이트 */}
        {insights.length === 0 ? (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-[#4A6741]/30 bg-white p-10 text-center">
            <p className="text-gray-600">
              등록된 숙소가 없어요. 먼저 숙소를 등록하면 인사이트가 쌓이기 시작합니다.
            </p>
            <Link
              href="/host/properties/new"
              className="mt-4 inline-block rounded-xl bg-[#D97B3F] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#C26A30]"
            >
              숙소 등록하기 →
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-bold text-[#1F2937]">숙소별 상세</h2>
            {insights.map((i) => {
              const maxView = Math.max(...i.viewsByDay.map((d) => d.count), 1);
              return (
                <div
                  key={i.propertyId}
                  className="rounded-2xl border border-gray-200 bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-[#1F2937]">{i.title}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span>노출 {i.totalViews30d}회</span>
                        <span>예약 {i.totalBookings}건</span>
                        <span>전환율 {i.conversionRate}%</span>
                        {i.reviewCount > 0 && (
                          <span>
                            ★ {i.avgRating.toFixed(1)} ({i.reviewCount})
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/host/properties/${i.propertyId}/edit`}
                      className="shrink-0 rounded-lg border border-[#4A6741] px-3 py-1.5 text-xs font-semibold text-[#4A6741] hover:bg-[#4A6741] hover:text-white"
                    >
                      수정
                    </Link>
                  </div>

                  {/* 14일 sparkline */}
                  <div className="mt-4">
                    <div className="flex items-end gap-1 h-16">
                      {i.viewsByDay.map((d) => (
                        <div
                          key={d.date}
                          className="flex-1 rounded-t bg-[#4A6741]/20"
                          style={{
                            height: `${(d.count / maxView) * 100}%`,
                            minHeight: d.count > 0 ? "4px" : "1px",
                            background: d.count > 0 ? "#4A6741" : "#E5E7EB",
                          }}
                          title={`${d.date}: ${d.count}회`}
                        />
                      ))}
                    </div>
                    <div className="mt-1 flex justify-between text-[10px] text-gray-400">
                      <span>14일 전</span>
                      <span>오늘</span>
                    </div>
                  </div>

                  {/* Source 비율 */}
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-lg bg-[#F5F1E8] p-2 text-center">
                      <div className="font-bold text-[#4A6741]">{i.bySource.page}</div>
                      <div className="text-gray-500">상세 페이지</div>
                    </div>
                    <div className="rounded-lg bg-[#F5F1E8] p-2 text-center">
                      <div className="font-bold text-[#D97B3F]">{i.bySource.recommend}</div>
                      <div className="text-gray-500">AI 추천</div>
                    </div>
                    <div className="rounded-lg bg-[#F5F1E8] p-2 text-center">
                      <div className="font-bold text-[#4A6741]">{i.bySource.list}</div>
                      <div className="text-gray-500">목록 검색</div>
                    </div>
                  </div>

                  {/* 코칭 힌트 */}
                  <div className="mt-4 rounded-lg border-l-2 border-[#D97B3F] bg-[#F5F1E8]/50 px-3 py-2 text-xs">
                    <strong className="text-[#D97B3F]">VINTEE 코칭 · </strong>
                    <span className="text-gray-700">{i.geoScoreHint}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
