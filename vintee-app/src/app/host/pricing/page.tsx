// ISS-025: 호스트 가격 정책 페이지
// brand voice: 다정하고 정직한 비교. 야놀자 대비 차별화 명시.

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "호스트 요금 — VINTEE",
  description:
    "VINTEE 호스트는 광고비 없이 GraphRAG가 자동 추천합니다. 야놀자 대비 75% 절감, 3개월 무료 트라이얼.",
};

const PLANS = [
  {
    key: "trial",
    badge: "지금 가입하면",
    name: "Trial",
    subtitle: "3개월 무료",
    monthly: "0원",
    fee: "수수료 5%",
    cta: "지금 시작하기",
    highlight: false,
    features: [
      "3개월간 월 구독료 0원",
      "예약마다 5%만 차감 (야놀자 20% 대비 75% 절감)",
      "GEO 점수 시스템 + AI 검색 노출",
      "예약 알림 + 리뷰 답글",
      "호스트 대시보드",
    ],
    note: "Trial 종료 후 자동 Starter로 전환되거나, 다른 플랜 선택 가능합니다.",
  },
  {
    key: "starter",
    badge: "가장 인기",
    name: "Starter",
    subtitle: "꾸준히 운영하는 호스트",
    monthly: "10,000원",
    fee: "+ 수수료 5%",
    cta: "Trial 후 시작",
    highlight: true,
    features: [
      "Trial의 모든 기능",
      "AI 검색 우선 노출 가중치 +10%",
      "월간 인사이트 리포트",
      "응답 시간 24시간 이내 SLA 배지",
      "이메일 + 카카오 알림",
    ],
    note: "예약이 0건인 달은 구독료가 면제됩니다 (No Sale No Fee).",
  },
  {
    key: "pro",
    badge: "성장 단계",
    name: "Pro",
    subtitle: "다국어 + 마케팅 지원",
    monthly: "30,000원",
    fee: "+ 수수료 2.5%",
    cta: "Trial 후 시작",
    highlight: false,
    features: [
      "Starter의 모든 기능",
      "수수료 2.5%로 절감 (예약 많을수록 이득)",
      "다국어 자동 번역 (EN/JA/ZH)",
      "지역 가이드 블로그 자동 게시",
      "주간 인사이트 + 코칭 메일",
    ],
    note: "월 예약 GMV 500만원 이상이면 Pro가 Starter보다 저렴합니다.",
  },
  {
    key: "success",
    badge: "위험 0",
    name: "SuccessFee",
    subtitle: "구독료 부담 없이",
    monthly: "0원",
    fee: "수수료 8%",
    cta: "선택하기",
    highlight: false,
    features: [
      "월 구독료 영구 0원",
      "예약이 있을 때만 8% 차감",
      "GEO 점수 + 기본 AI 노출",
      "예약 알림 + 리뷰 답글",
    ],
    note: "안정적 예약이 보장되지 않는 호스트에게 추천합니다.",
  },
];

const COMPARISON = [
  { who: "에어비앤비", host: "3%", guest: "14%", total: "17%", sub: "없음", ad: "선택" },
  { who: "야놀자/여기어때", host: "15%", guest: "5~10%", total: "20~25%", sub: "없음", ad: "필수 50만원+/월" },
  { who: "네이버 예약", host: "0%", guest: "0%", total: "0%", sub: "없음", ad: "검색광고 필수" },
  { who: "VINTEE Starter", host: "5%", guest: "0%", total: "5%", sub: "1만원", ad: "0원 (AI 자동)" },
  { who: "VINTEE Trial", host: "5%", guest: "0%", total: "5%", sub: "0원 (3개월)", ad: "0원" },
];

export default function HostPricingPage() {
  return (
    <div className="bg-[#F5F1E8] py-12">
      <div className="mx-auto max-w-5xl px-4">
        {/* Hero */}
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#4A6741]">
            For Hosts · 정직한 가격
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#1F2937] md:text-4xl">
            광고비 0원, AI가 자동으로 추천해드려요
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-gray-600">
            야놀자처럼 광고비를 강요하지 않습니다. GEO 점수와 GraphRAG가 운영을 잘하는 숙소를
            먼저 보여줍니다. 첫 3개월은 무료, 그 후에도 부담 없는 요금제를 선택하세요.
          </p>
        </div>

        {/* Plans */}
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p) => (
            <div
              key={p.key}
              className={`relative rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md ${
                p.highlight ? "border-[#4A6741] ring-2 ring-[#4A6741]/20" : "border-gray-200"
              }`}
            >
              {p.badge && (
                <span
                  className={`absolute -top-3 left-6 rounded-full px-3 py-1 text-[11px] font-bold ${
                    p.highlight ? "bg-[#D97B3F] text-white" : "bg-[#4A6741] text-white"
                  }`}
                >
                  {p.badge}
                </span>
              )}
              <h2 className="text-lg font-bold text-[#1F2937]">{p.name}</h2>
              <p className="mt-1 text-xs text-gray-500">{p.subtitle}</p>
              <div className="mt-4">
                <div className="text-3xl font-bold text-[#4A6741]">{p.monthly}</div>
                <div className="mt-0.5 text-xs text-gray-500">월 구독료 {p.fee}</div>
              </div>
              <ul className="mt-5 space-y-2 text-sm text-gray-700">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <svg
                      width={14}
                      height={14}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#4A6741"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mt-1 shrink-0"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-gray-100 pt-3 text-xs italic text-gray-500">
                {p.note}
              </p>
              <Link
                href="/register?role=host"
                className={`mt-5 block rounded-xl px-4 py-2.5 text-center text-sm font-bold transition ${
                  p.highlight
                    ? "bg-[#D97B3F] text-white hover:bg-[#C26A30]"
                    : "border border-[#4A6741] text-[#4A6741] hover:bg-[#4A6741] hover:text-white"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-[#1F2937]">
            왜 VINTEE인가요? — 솔직 비교표
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            호스트가 받는 부담을 한눈에 비교해드립니다. 숨김 비용 없이 정직하게.
          </p>
          <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F1E8] text-[#4A6741]">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">플랫폼</th>
                  <th className="px-4 py-3 text-center font-semibold">호스트 수수료</th>
                  <th className="px-4 py-3 text-center font-semibold">게스트 수수료</th>
                  <th className="px-4 py-3 text-center font-semibold">합계</th>
                  <th className="px-4 py-3 text-center font-semibold">월 구독료</th>
                  <th className="px-4 py-3 text-center font-semibold">광고비</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {COMPARISON.map((row) => {
                  const isVintee = row.who.startsWith("VINTEE");
                  return (
                    <tr
                      key={row.who}
                      className={isVintee ? "bg-[#F5F1E8]/50 font-semibold text-[#4A6741]" : ""}
                    >
                      <td className="px-4 py-3">{row.who}</td>
                      <td className="px-4 py-3 text-center">{row.host}</td>
                      <td className="px-4 py-3 text-center">{row.guest}</td>
                      <td className="px-4 py-3 text-center">{row.total}</td>
                      <td className="px-4 py-3 text-center">{row.sub}</td>
                      <td className="px-4 py-3 text-center">{row.ad}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            * 2026년 4월 기준 각 플랫폼 공개 정책. VINTEE는 게스트 수수료를 받지 않습니다.
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-16 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="font-bold text-[#1F2937]">정산은 언제 받나요?</h3>
            <p className="mt-2 text-sm text-gray-600">
              체크아웃 후 7일째 등록한 계좌로 자동 이체됩니다. (Trial은 결제 시스템 연동 후
              제공)
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="font-bold text-[#1F2937]">예약이 없는 달도 구독료를 내나요?</h3>
            <p className="mt-2 text-sm text-gray-600">
              Starter/Pro는 No Sale No Fee 정책으로, 예약 0건이면 그 달 구독료가 면제됩니다.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="font-bold text-[#1F2937]">광고비를 안 내도 노출되나요?</h3>
            <p className="mt-2 text-sm text-gray-600">
              네. VINTEE는 GraphRAG 자연어 추천이 알고리즘 핵심이라, 운영을 잘하는 숙소가 자동
              상단 노출됩니다. 야놀자처럼 광고비로 순위 매수할 수 없습니다.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="font-bold text-[#1F2937]">언제든 플랜을 바꿀 수 있나요?</h3>
            <p className="mt-2 text-sm text-gray-600">
              네. 호스트 대시보드에서 언제든 플랜 변경/해지 가능합니다. 위약금 없습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
