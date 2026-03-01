import { getUser } from "@/lib/supabase/auth-helpers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ReviewPageClient } from "@/components/review/review-page-client";
import { MapPin, Calendar } from "lucide-react";

interface ReviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const authUser = await getUser();
  const userId = authUser?.profile?.id;

  if (!userId) {
    redirect("/login");
  }

  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      property: {
        select: {
          id: true,
          name: true,
          address: true,
          thumbnailUrl: true,
        },
      },
      review: true,
    },
  });

  // 유효하지 않은 접근 차단
  if (!booking || booking.userId !== userId) {
    redirect("/bookings");
  }

  // 이미 리뷰 작성됨
  if (booking!.review) {
    redirect(`/bookings/${id}`);
  }

  // 완료되지 않은 예약
  if (booking!.status !== "COMPLETED") {
    redirect(`/bookings/${id}`);
  }

  // 체크아웃 이전
  if (new Date(booking!.checkOut) > new Date()) {
    redirect(`/bookings/${id}`);
  }

  const validBooking = booking!;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <Link href={`/bookings/${id}`}>
            <Button variant="outline" size="sm" className="mb-4">
              ← 예약으로 돌아가기
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">리뷰 작성</h1>
          <p className="text-gray-600 mt-1">
            이번 숙박 경험을 다른 게스트들과 공유해주세요
          </p>
        </div>

        {/* Property Summary */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {validBooking.property.thumbnailUrl && (
                <img
                  src={validBooking.property.thumbnailUrl}
                  alt={validBooking.property.name}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900 truncate">
                  {validBooking.property.name}
                </h2>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                  <span className="truncate">{validBooking.property.address}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Calendar className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                  <span>
                    {format(new Date(validBooking.checkIn), "M월 d일", { locale: ko })}
                    {" ~ "}
                    {format(new Date(validBooking.checkOut), "M월 d일", { locale: ko })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Form */}
        <Card>
          <CardHeader>
            <CardTitle>이번 숙소는 어떠셨나요?</CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewPageClient
              bookingId={validBooking.id}
              propertyId={validBooking.property.id}
              propertyName={validBooking.property.name}
              redirectUrl={`/bookings/${id}`}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
