export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { calculateGeoScore, type GeoScoreItem } from "@/lib/utils/geo-score";
import GeoScoreSelector from "./GeoScoreSelector";

function StatusIcon({ status }: { status: GeoScoreItem["status"] }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (status === "pass") {
    return (
      <svg {...common} stroke="#10B981" aria-label="통과">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    );
  }
  if (status === "warn") {
    return (
      <svg {...common} stroke="#F59E0B" aria-label="경고">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  }
  return (
    <svg {...common} stroke="#EF4444" aria-label="실패">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

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
          {result.items.map((item) => (
            <li
              key={item.label}
              className="flex items-center justify-between py-2.5 text-sm text-gray-700"
            >
              <span className="flex items-center gap-2">
                <StatusIcon status={item.status} />
                {item.label}
              </span>
              <span className="font-semibold text-[#16325C]">
                {item.score}/{item.maxScore}
              </span>
            </li>
          ))}
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
