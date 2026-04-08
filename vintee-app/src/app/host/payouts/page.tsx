// ISS-042: 호스트 정산 리포트 페이지
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getHostPayouts } from "@/lib/payouts";

export default async function HostPayoutsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "HOST" && user.role !== "ADMIN")) redirect("/");

  const payouts = await getHostPayouts(user.id);

  return (
    <div className="bg-[#F5F1E8] py-10">
      <div className="mx-auto max-w-5xl px-4">
        {/* 헤더 */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#4A6741]">
              Payouts · 정산 리포트
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#1F2937]">
              이번 달 내 수익
            </h1>
          </div>
          <Link href="/host" className="text-sm text-[#4A6741] hover:underline">
            ← 대시보드로
          </Link>
        </div>

        {/* 핵심 카드 4개 */}
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-[#4A6741]/20 bg-white p-5">
            <p className="text-xs font-semibold text-gray-500">이번 달 순수익</p>
            <p className="mt-1 text-2xl font-bold text-[#4A6741]">
              {payouts.thisMonth.netAmount.toLocaleString()}원
            </p>
            <p className="mt-1 text-xs text-gray-400">
              결제 {payouts.thisMonth.paidCount}건 · 수수료 제외
            </p>
          </div>
          <div className="rounded-2xl border border-[#4A6741]/20 bg-white p-5">
            <p className="text-xs font-semibold text-gray-500">미정산 금액</p>
            <p className="mt-1 text-2xl font-bold text-[#D97B3F]">
              {payouts.pendingPayoutAmount.toLocaleString()}원
            </p>
            <p className="mt-1 text-xs text-gray-400">
              다음 정산일: {payouts.nextPayoutDate}
            </p>
          </div>
          <div className="rounded-2xl border border-[#4A6741]/20 bg-white p-5">
            <p className="text-xs font-semibold text-gray-500">지난달 순수익</p>
            <p className="mt-1 text-2xl font-bold text-[#1F2937]">
              {(payouts.lastMonth?.netAmount ?? 0).toLocaleString()}원
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {payouts.lastMonth?.paidCount ?? 0}건
            </p>
          </div>
          <div className="rounded-2xl border border-[#4A6741]/20 bg-white p-5">
            <p className="text-xs font-semibold text-gray-500">누적 순수익</p>
            <p className="mt-1 text-2xl font-bold text-[#1F2937]">
              {payouts.totalLifetimeNet.toLocaleString()}원
            </p>
            <p className="mt-1 text-xs text-gray-400">최근 6개월</p>
          </div>
        </div>

        {/* 월별 테이블 */}
        <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F1E8] text-[#4A6741]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">월</th>
                <th className="px-4 py-3 text-right font-semibold">예약 수</th>
                <th className="px-4 py-3 text-right font-semibold">결제 완료</th>
                <th className="px-4 py-3 text-right font-semibold">총 매출</th>
                <th className="px-4 py-3 text-right font-semibold">수수료</th>
                <th className="px-4 py-3 text-right font-semibold">순수익</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payouts.last6Months.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    아직 정산 내역이 없어요. 첫 예약이 들어오면 여기에 쌓입니다.
                  </td>
                </tr>
              ) : (
                payouts.last6Months.map((m) => (
                  <tr key={m.yearMonth}>
                    <td className="px-4 py-3 font-semibold">{m.yearMonth}</td>
                    <td className="px-4 py-3 text-right">{m.bookingCount}</td>
                    <td className="px-4 py-3 text-right">{m.paidCount}</td>
                    <td className="px-4 py-3 text-right">
                      {m.grossAmount.toLocaleString()}원
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      -{m.commission.toLocaleString()}원
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-[#4A6741]">
                      {m.netAmount.toLocaleString()}원
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 정책 안내 */}
        <div className="mt-6 rounded-xl border-l-2 border-[#D97B3F] bg-white px-4 py-3 text-xs text-gray-700">
          <strong className="text-[#D97B3F]">정산 정책 · </strong>
          매월 10일, 전월 결제 완료 건을 등록 계좌로 이체합니다. 수수료율은 플랜별로
          다르며(Trial/Starter 5%, Pro 2.5%, SuccessFee 8%), 취소된 예약은 제외됩니다.
          <Link href="/host/pricing" className="ml-2 font-semibold text-[#4A6741] hover:underline">
            플랜 비교 →
          </Link>
        </div>
      </div>
    </div>
  );
}
