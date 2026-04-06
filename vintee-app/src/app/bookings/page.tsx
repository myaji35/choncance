export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { canWriteReview } from "@/lib/utils/review";

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: "대기중", color: "#F59E0B" },
  CONFIRMED: { label: "확정", color: "#00A1E0" },
  COMPLETED: { label: "완료", color: "#10B981" },
  CANCELLED: { label: "취소", color: "#EF4444" },
};

export default async function BookingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: {
      property: { select: { id: true, title: true, location: true } },
      review: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-xl font-bold text-[#16325C]">내 예약</h1>

      {bookings.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-gray-400">예약 내역이 없습니다</p>
          <Link
            href="/properties"
            className="mt-4 inline-block text-sm text-[#00A1E0] hover:underline"
          >
            숙소 둘러보기
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {bookings.map((b) => {
            const status = statusMap[b.status] || { label: b.status, color: "#6B7280" };
            const showReview = canWriteReview(b);

            return (
              <Link
                key={b.id}
                href={`/bookings/${b.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 transition hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{b.property.title}</h3>
                    <p className="mt-0.5 text-sm text-gray-500">{b.property.location}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(b.checkIn).toLocaleDateString("ko-KR")} ~{" "}
                      {new Date(b.checkOut).toLocaleDateString("ko-KR")}
                    </p>
                    {b.totalPrice > 0 && (
                      <p className="mt-0.5 text-sm font-medium text-[#16325C]">
                        {b.totalPrice.toLocaleString()}원
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className="rounded px-2 py-0.5 text-xs font-bold text-white"
                      style={{ background: status.color }}
                    >
                      {status.label}
                    </span>
                    {showReview && (
                      <span className="text-xs text-[#00A1E0]">리뷰 작성 가능</span>
                    )}
                    {b.review && (
                      <span className="text-xs text-gray-400">리뷰 완료</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
