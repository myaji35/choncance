export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { calculateGeoScore } from "@/lib/utils/geo-score";
import GeoScoreSelector from "./GeoScoreSelector";

export default async function HostGeoPage({
  searchParams,
}: {
  searchParams: Promise<{ propertyId?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "HOST") redirect("/login");

  const properties = await prisma.property.findMany({
    where: { hostId: user.id },
    select: { id: true, title: true, location: true },
    orderBy: { createdAt: "desc" },
  });

  if (properties.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-xl font-bold text-[#16325C]">GEO 최적화 점수</h1>
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
          아직 등록한 숙소가 없습니다.
          <div className="mt-3">
            <Link
              href="/host/properties/new"
              className="inline-block rounded-lg bg-[#00A1E0] px-4 py-2 text-sm font-bold text-white"
            >
              숙소 등록하기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const sp = await searchParams;
  const selectedId = sp.propertyId ?? properties[0].id;
  const selected = properties.find((p) => p.id === selectedId) ?? properties[0];

  const property = await prisma.property.findUnique({ where: { id: selected.id } });
  if (!property || property.hostId !== user.id) redirect("/host/geo");

  const [count, agg, replied] = await Promise.all([
    prisma.review.count({ where: { propertyId: selected.id } }),
    prisma.review.aggregate({ where: { propertyId: selected.id }, _avg: { rating: true } }),
    prisma.review.count({ where: { propertyId: selected.id, hostReply: { not: null } } }),
  ]);
  const replyRate = count > 0 ? replied / count : 0;
  const result = calculateGeoScore(property, {
    count,
    avgRating: agg._avg.rating ?? 0,
    replyRate,
  });

  const barColor =
    result.total >= 80 ? "bg-emerald-500" : result.total >= 60 ? "bg-[#00A1E0]" : "bg-amber-500";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-xl font-bold text-[#16325C]">GEO 최적화 점수</h1>
      <p className="mt-1 text-sm text-gray-600">
        숙소 정보를 풍부하게 채울수록 AI 검색과 지도 노출에 유리합니다.
      </p>

      <div className="mt-6">
        <GeoScoreSelector properties={properties} selectedId={selected.id} />
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold text-gray-600">총점</span>
          <span className="text-3xl font-bold text-[#16325C]">
            {result.total}
            <span className="text-base text-gray-400"> / 100</span>
          </span>
        </div>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full transition-all ${barColor}`}
            style={{ width: `${result.total}%` }}
          />
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-[#16325C]">항목별 점수</h2>
        <ul className="mt-3 divide-y divide-gray-200">
          {result.items.map((item) => {
            const icon = item.status === "pass" ? "✅" : item.status === "warn" ? "⚠️" : "❌";
            return (
              <li
                key={item.label}
                className="flex items-center justify-between py-2.5 text-sm text-gray-700"
              >
                <span>
                  {icon} {item.label}
                </span>
                <span className="font-semibold text-[#16325C]">
                  {item.score}/{item.maxScore}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {result.suggestions.length > 0 && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-sm font-semibold text-amber-800">개선 제안</h2>
          <ul className="mt-3 space-y-1.5 text-sm text-amber-900">
            {result.suggestions.map((s) => (
              <li key={s}>· {s}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Link
          href={`/host/properties/${selected.id}/edit`}
          className="rounded-lg bg-[#00A1E0] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0090C7]"
        >
          숙소 정보 수정하기
        </Link>
      </div>
    </div>
  );
}
