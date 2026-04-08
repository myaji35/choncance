export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HostDashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "HOST") redirect("/");

  const [properties, totalBookings, pendingBookings, totalReviews] =
    await Promise.all([
      prisma.property.findMany({
        where: { hostId: user.id },
        include: { _count: { select: { bookings: true, reviews: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.booking.count({
        where: { property: { hostId: user.id } },
      }),
      prisma.booking.count({
        where: { property: { hostId: user.id }, status: "PENDING" },
      }),
      prisma.review.count({
        where: { property: { hostId: user.id } },
      }),
    ]);

  // ISS-025: 호스트 플랜 정보 (없으면 trial 기본값 + 90일 후 종료)
  const primaryPlan = properties[0]?.subscriptionPlan ?? "trial";
  const planLabels: Record<string, { name: string; color: string; fee: string }> = {
    trial: { name: "Trial", color: "#D97B3F", fee: "수수료 5%만 (3개월 무료)" },
    starter: { name: "Starter", color: "#4A6741", fee: "10,000원/월 + 5%" },
    pro: { name: "Pro", color: "#4A6741", fee: "30,000원/월 + 2.5%" },
    success: { name: "SuccessFee", color: "#6B7280", fee: "0원 + 8%" },
  };
  const planInfo = planLabels[primaryPlan] ?? planLabels.trial;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#16325C]">호스트 대시보드</h1>
        <Link
          href="/host/properties/new"
          className="rounded-lg bg-[#D97B3F] px-4 py-2 text-sm font-bold text-white hover:bg-[#C26A30]"
        >
          + 숙소 등록
        </Link>
      </div>

      {/* ISS-025: 내 플랜 카드 */}
      <div className="mt-5 rounded-2xl border border-[#4A6741]/20 bg-[#F5F1E8] p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#4A6741]">
              내 플랜
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span
                className="rounded-full px-3 py-1 text-sm font-bold text-white"
                style={{ background: planInfo.color }}
              >
                {planInfo.name}
              </span>
              <span className="text-sm text-gray-700">{planInfo.fee}</span>
            </div>
            <p className="mt-2 text-xs text-gray-600">
              광고비 0원 · GraphRAG 자동 추천 · 야놀자 대비 75% 절감
            </p>
          </div>
          <Link
            href="/host/pricing"
            className="shrink-0 rounded-xl border border-[#4A6741] bg-white px-4 py-2 text-xs font-bold text-[#4A6741] hover:bg-[#4A6741] hover:text-white"
          >
            플랜 비교
          </Link>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-[#16325C]">{properties.length}</p>
          <p className="text-xs text-gray-500">등록 숙소</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-[#00A1E0]">{totalBookings}</p>
          <p className="text-xs text-gray-500">전체 예약</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-[#F59E0B]">{pendingBookings}</p>
          <p className="text-xs text-gray-500">승인 대기</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-[#10B981]">{totalReviews}</p>
          <p className="text-xs text-gray-500">리뷰</p>
        </div>
      </div>

      {/* 숙소 목록 */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-[#16325C]">내 숙소</h2>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/host/bookings" className="text-[#4A6741] hover:underline">
              예약 관리
            </Link>
            <Link href="/host/reviews" className="text-[#4A6741] hover:underline">
              리뷰 관리
            </Link>
            <Link href="/host/geo" className="text-[#4A6741] hover:underline">
              GEO 점수
            </Link>
            <Link href="/host/insights" className="text-[#4A6741] hover:underline">
              인사이트
            </Link>
          </div>
        </div>

        {properties.length === 0 ? (
          <div className="mt-4 rounded-2xl border-2 border-dashed border-[#4A6741]/30 bg-white p-8 text-center">
            <svg
              width={48}
              height={48}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4A6741"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <h3 className="mt-3 text-lg font-bold text-[#1F2937]">
              첫 숙소를 등록해볼까요?
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
              사진 한 장과 짧은 소개만 있으면 충분해요. GEO 점수 시스템이 무엇을
              보강하면 노출이 늘지 알려드리고, GraphRAG가 자연어 검색에서 자동 추천합니다.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs">
              <span className="rounded-full bg-[#F5F1E8] px-3 py-1.5 text-[#4A6741]">
                3개월 무료
              </span>
              <span className="rounded-full bg-[#F5F1E8] px-3 py-1.5 text-[#4A6741]">
                광고비 0원
              </span>
              <span className="rounded-full bg-[#F5F1E8] px-3 py-1.5 text-[#4A6741]">
                수수료 5%만
              </span>
            </div>
            <Link
              href="/host/properties/new"
              className="mt-5 inline-block rounded-xl bg-[#D97B3F] px-6 py-3 text-sm font-bold text-white hover:bg-[#C26A30]"
            >
              숙소 등록 시작하기 →
            </Link>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {properties.map((p) => {
              const statusColors: Record<string, string> = {
                active: "#10B981",
                draft: "#F59E0B",
                inactive: "#6B7280",
              };
              return (
                <Link
                  key={p.id}
                  href={`/host/properties/${p.id}/edit`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition hover:shadow-md"
                >
                  <div>
                    <h3 className="font-bold text-gray-900">{p.title}</h3>
                    <p className="text-sm text-gray-500">
                      {p.location} · 예약 {p._count.bookings}건 · 리뷰 {p._count.reviews}건
                    </p>
                  </div>
                  <span
                    className="rounded px-2 py-0.5 text-xs font-bold text-white"
                    style={{ background: statusColors[p.status] || "#6B7280" }}
                  >
                    {p.status === "active" ? "운영중" : p.status === "draft" ? "임시저장" : "비활성"}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
