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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#16325C]">호스트 대시보드</h1>
        <Link
          href="/host/properties/new"
          className="rounded-lg bg-[#00A1E0] px-4 py-2 text-sm font-medium text-white hover:bg-[#0090C7]"
        >
          + 숙소 등록
        </Link>
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
          <Link href="/host/reviews" className="text-sm text-[#00A1E0] hover:underline">
            리뷰 관리
          </Link>
        </div>

        {properties.length === 0 ? (
          <p className="mt-4 text-center text-gray-400">등록된 숙소가 없습니다</p>
        ) : (
          <div className="mt-3 space-y-3">
            {properties.map((p) => {
              const statusColors: Record<string, string> = {
                active: "#10B981",
                draft: "#F59E0B",
                inactive: "#6B7280",
              };
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
