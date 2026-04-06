export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ReviewPageClient from "./ReviewPageClient";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: bookingId } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      property: { select: { id: true, title: true, thumbnailUrl: true } },
      review: { select: { id: true } },
    },
  });

  if (!booking) {
    redirect("/");
  }

  // 이미 리뷰 작성 완료
  if (booking.review) {
    redirect(`/bookings/${bookingId}`);
  }

  // 완료 상태가 아니면 작성 불가
  if (booking.status !== "COMPLETED") {
    redirect(`/bookings/${bookingId}`);
  }

  // 체크아웃 전이면 작성 불가
  if (new Date(booking.checkOut) > new Date()) {
    redirect(`/bookings/${bookingId}`);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      {/* 뒤로가기 */}
      <a
        href={`/bookings/${bookingId}`}
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        예약으로 돌아가기
      </a>

      {/* 숙소 요약 */}
      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-lg font-bold text-[#16325C]">
          {booking.property.title}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {new Date(booking.checkIn).toLocaleDateString("ko-KR")} ~{" "}
          {new Date(booking.checkOut).toLocaleDateString("ko-KR")}
        </p>
      </div>

      {/* 리뷰 폼 */}
      <div className="mt-6">
        <ReviewPageClient bookingId={bookingId} />
      </div>
    </div>
  );
}
