import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireHost, getCurrentUser } from "@/lib/auth-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageSquare, Star } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ReviewCard } from "@/components/review/review-card";

export default async function HostReviewsPage() {
  await requireHost();

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const hostProfile = await prisma.hostProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!hostProfile) {
    redirect("/host/dashboard");
  }

  // 호스트 소유 숙소의 모든 리뷰 조회
  const reviews = await prisma.review.findMany({
    where: {
      property: {
        hostId: hostProfile.id,
      },
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      property: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const unansweredCount = reviews.filter((r) => !r.hostReply).length;
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/host/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              ← 대시보드로
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">리뷰 관리</h1>
              <p className="text-gray-600 mt-1">
                게스트들이 남긴 리뷰를 확인하고 답변을 달아보세요
              </p>
            </div>
          </div>
        </div>

        {/* 요약 통계 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
              <p className="text-sm text-gray-600 mt-1">전체 리뷰</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <p className="text-2xl font-bold text-gray-900">
                  {avgRating.toFixed(1)}
                </p>
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-sm text-gray-600 mt-1">평균 별점</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">
                {unansweredCount}
              </p>
              <p className="text-sm text-gray-600 mt-1">미답변</p>
            </CardContent>
          </Card>
        </div>

        {/* 리뷰 목록 */}
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                아직 리뷰가 없습니다
              </p>
              <p className="text-gray-400 text-sm mt-2">
                게스트들이 체크아웃 후 리뷰를 남기면 여기에 표시됩니다
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* 미답변 필터 표시 */}
            {unansweredCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-4 py-2 rounded-lg">
                <MessageSquare className="w-4 h-4" />
                <span>
                  답변이 필요한 리뷰가 <strong>{unansweredCount}개</strong>{" "}
                  있습니다
                </span>
              </div>
            )}

            {reviews.map((review) => (
              <div key={review.id} className="space-y-1">
                {/* 숙소명 표시 */}
                <div className="flex items-center gap-2 px-1">
                  <Link
                    href={`/property/${review.property.id}`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    {review.property.name}
                  </Link>
                  {!review.hostReply && (
                    <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                      미답변
                    </Badge>
                  )}
                </div>
                <ReviewCard
                  review={{
                    id: review.id,
                    rating: review.rating,
                    content: review.content,
                    images: review.images,
                    createdAt: review.createdAt.toISOString(),
                    user: {
                      name: review.user.name,
                      image: review.user.image,
                    },
                    hostReply: review.hostReply,
                    repliedAt: review.repliedAt?.toISOString() ?? null,
                  }}
                  isHost={true}
                  showProperty={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
