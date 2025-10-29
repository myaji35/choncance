import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, Users, Phone, Mail } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { CancelBookingDialog } from "@/components/booking/cancel-booking-dialog";
import { WriteReviewDialog } from "@/components/review/write-review-dialog";

interface BookingDetailPageProps {
  params: {
    id: string;
  };
}

async function getBookingDetails(bookingId: string, userId: string) {
  try {
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId, // Ensure user owns this booking
      },
      include: {
        property: {
          include: {
            host: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
            tags: true,
          },
        },
        items: {
          include: {
            experience: true,
          },
        },
        payment: true,
        review: true,
      },
    });

    return booking;
  } catch (error) {
    console.error("Failed to fetch booking:", error);
    return null;
  }
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const booking = await getBookingDetails(params.id, userId);

  if (!booking) {
    notFound();
  }

  const checkIn = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);
  const imageUrl = booking.property.thumbnailUrl || booking.property.images[0] || "/placeholder-property.jpg";

  const getStatusInfo = (status: string) => {
    const info: Record<string, { label: string; color: string; description: string }> = {
      PENDING: {
        label: "결제 대기",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        description: "결제가 완료되지 않았습니다",
      },
      CONFIRMED: {
        label: "예약 확정",
        color: "bg-green-100 text-green-800 border-green-200",
        description: "예약이 확정되었습니다",
      },
      CANCELLED: {
        label: "취소됨",
        color: "bg-red-100 text-red-800 border-red-200",
        description: "예약이 취소되었습니다",
      },
      COMPLETED: {
        label: "완료",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        description: "숙박이 완료되었습니다",
      },
      REJECTED: {
        label: "거절됨",
        color: "bg-gray-100 text-gray-800 border-gray-200",
        description: "호스트가 예약을 거절했습니다",
      },
      NO_SHOW: {
        label: "노쇼",
        color: "bg-gray-100 text-gray-800 border-gray-200",
        description: "체크인하지 않았습니다",
      },
    };

    return info[status] || info.PENDING;
  };

  const statusInfo = getStatusInfo(booking.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Navigation */}
        <Link
          href="/bookings"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>내 예약으로 돌아가기</span>
        </Link>

        {/* Status Banner */}
        <Card className={`mb-6 border-2 ${statusInfo.color}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-1">{statusInfo.label}</h2>
                <p className="text-sm">{statusInfo.description}</p>
              </div>
              <div className="text-sm text-gray-600">
                예약 번호: {booking.id.slice(0, 8).toUpperCase()}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>숙소 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative aspect-[16/9] rounded-lg overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={booking.property.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {booking.property.name}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{booking.property.address}</span>
                  </div>
                </div>

                {/* Check-in/out Details */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">체크인</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">
                          {format(checkIn, "PPP (eee)", { locale: ko })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 ml-6">
                        {booking.property.checkInTime} 이후
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">체크아웃</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">
                          {format(checkOut, "PPP (eee)", { locale: ko })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 ml-6">
                        {booking.property.checkOutTime} 이전
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{booking.guests}명</span>
                  <span className="text-gray-600">·</span>
                  <span className="text-gray-600">{booking.numberOfNights}박</span>
                </div>
              </CardContent>
            </Card>

            {/* Guest Information */}
            <Card>
              <CardHeader>
                <CardTitle>예약자 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span>{booking.guestName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{booking.guestPhone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{booking.guestEmail}</span>
                </div>
              </CardContent>
            </Card>

            {/* Special Requests */}
            {booking.specialRequests && (
              <Card>
                <CardHeader>
                  <CardTitle>특별 요청사항</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {booking.specialRequests}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Host Information */}
            <Card>
              <CardHeader>
                <CardTitle>호스트 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span>{booking.property.host.user.name || "호스트"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{booking.property.host.contact}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payment Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>결제 내역</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>
                      ₩{Number(booking.nightlyRate).toLocaleString()} × {booking.numberOfNights}박
                    </span>
                    <span>₩{Number(booking.accommodationTotal).toLocaleString()}</span>
                  </div>

                  {Number(booking.experiencesTotal) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>체험</span>
                      <span>₩{Number(booking.experiencesTotal).toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span>서비스 수수료</span>
                    <span>₩{Number(booking.serviceFee).toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between font-bold text-lg pt-3 border-t">
                    <span>총 합계</span>
                    <span>₩{Number(booking.totalAmount).toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment Status */}
                {booking.payment && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-1">결제 상태</p>
                    <p className="font-medium">
                      {booking.payment.status === "DONE"
                        ? "결제 완료"
                        : booking.payment.status === "READY"
                        ? "결제 대기"
                        : booking.payment.status === "CANCELLED"
                        ? "결제 취소"
                        : "결제 실패"}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 space-y-2">
                  {booking.status === "CONFIRMED" && (
                    <>
                      <Link href={`/property/${booking.property.id}`}>
                        <Button variant="outline" className="w-full">
                          숙소 정보 보기
                        </Button>
                      </Link>
                      <CancelBookingDialog
                        bookingId={booking.id}
                        checkInDate={checkIn}
                        totalAmount={Number(booking.totalAmount)}
                      >
                        <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                          예약 취소하기
                        </Button>
                      </CancelBookingDialog>
                    </>
                  )}

                  {booking.status === "COMPLETED" && !booking.review && (
                    <WriteReviewDialog
                      bookingId={booking.id}
                      propertyName={booking.property.name}
                    >
                      <Button className="w-full">리뷰 작성하기</Button>
                    </WriteReviewDialog>
                  )}

                  {booking.status === "COMPLETED" && booking.review && (
                    <div className="text-center text-sm text-gray-600 py-2">
                      리뷰 작성 완료
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
