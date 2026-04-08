export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { canWriteReview } from "@/lib/utils/review";
import Link from "next/link";
import PayButton from "@/components/booking/PayButton";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      property: { select: { id: true, title: true, thumbnailUrl: true } },
      review: { select: { id: true, rating: true, content: true } },
    },
  });

  if (!booking) {
    redirect("/");
  }

  const showReviewButton = canWriteReview(booking);

  const statusMap: Record<string, { label: string; color: string }> = {
    PENDING: { label: "대기중", color: "#F59E0B" },
    CONFIRMED: { label: "확정", color: "#00A1E0" },
    COMPLETED: { label: "완료", color: "#10B981" },
    CANCELLED: { label: "취소", color: "#EF4444" },
  };

  const status = statusMap[booking.status] || {
    label: booking.status,
    color: "#6B7280",
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-xl font-bold text-[#16325C]">예약 상세</h1>

      <div className="mt-4 space-y-4">
        {/* 숙소 정보 */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="font-bold text-gray-900">{booking.property.title}</h2>
          <p className="mt-1 text-sm text-gray-500">
            {new Date(booking.checkIn).toLocaleDateString("ko-KR")} ~{" "}
            {new Date(booking.checkOut).toLocaleDateString("ko-KR")}
          </p>
          <p className="mt-1 text-sm font-bold text-[#1F2937]">
            {booking.totalPrice.toLocaleString()}원
          </p>
          <span
            className="mt-2 inline-block rounded px-2 py-0.5 text-xs font-bold text-white"
            style={{ background: status.color }}
          >
            {status.label}
          </span>
        </div>

        {/* ISS-041: 결제 */}
        <PayButton
          bookingId={id}
          amount={booking.totalPrice}
          paymentStatus={booking.paymentStatus}
          bookingStatus={booking.status}
        />

        {/* 리뷰 작성 버튼 */}
        {showReviewButton && (
          <Link
            href={`/bookings/${id}/review`}
            className="block w-full rounded-lg bg-[#00A1E0] py-2.5 text-center text-sm font-bold text-white hover:bg-[#0090C7]"
          >
            리뷰 작성하기
          </Link>
        )}

        {/* 작성된 리뷰 표시 */}
        {booking.review && (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="text-sm font-bold text-gray-700">내가 작성한 리뷰</h3>
            <div className="mt-2 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill={i < booking.review!.rating ? "#F59E0B" : "none"}
                  stroke={i < booking.review!.rating ? "#F59E0B" : "#D1D5DB"}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {booking.review.content}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
