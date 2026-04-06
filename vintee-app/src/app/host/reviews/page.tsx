export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { maskName } from "@/lib/utils/review";
import HostReviewsClient from "./HostReviewsClient";

export default async function HostReviewsPage() {
  // TODO: 실제 인증 연동 시 getCurrentUser()로 교체
  // 현재는 첫 번째 HOST 유저로 데모
  const host = await prisma.user.findFirst({
    where: { role: "HOST" },
  });

  if (!host) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-gray-500">호스트 계정이 필요합니다</p>
      </div>
    );
  }

  const properties = await prisma.property.findMany({
    where: { hostId: host.id },
    select: { id: true },
  });

  const propertyIds = properties.map((p) => p.id);

  const [reviews, totalCount, unrepliedCount, agg] = await Promise.all([
    prisma.review.findMany({
      where: { propertyId: { in: propertyIds } },
      include: {
        user: { select: { name: true } },
        property: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.count({ where: { propertyId: { in: propertyIds } } }),
    prisma.review.count({
      where: { propertyId: { in: propertyIds }, hostReply: null },
    }),
    prisma.review.aggregate({
      where: { propertyId: { in: propertyIds } },
      _avg: { rating: true },
    }),
  ]);

  const reviewData = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    content: r.content,
    guestName: maskName(r.user.name),
    createdAt: r.createdAt.toISOString(),
    hostReply: r.hostReply,
    repliedAt: r.repliedAt?.toISOString() ?? null,
    propertyTitle: r.property.title,
  }));

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-xl font-bold text-[#16325C]">리뷰 관리</h1>

      {/* 통계 */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-[#16325C]">{totalCount}</p>
          <p className="text-xs text-gray-500">전체 리뷰</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-[#00A1E0]">
            {(agg._avg.rating ?? 0).toFixed(1)}
          </p>
          <p className="text-xs text-gray-500">평균 별점</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-[#F59E0B]">{unrepliedCount}</p>
          <p className="text-xs text-gray-500">미답변</p>
        </div>
      </div>

      {/* 리뷰 목록 */}
      <div className="mt-6">
        <HostReviewsClient reviews={reviewData} />
      </div>
    </div>
  );
}
