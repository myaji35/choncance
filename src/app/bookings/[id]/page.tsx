import { getUser } from "@/lib/supabase/auth-helpers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Users,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";
import { ReviewDialog } from "@/components/review/review-dialog";
import { RefundDialog } from "@/components/payments/refund-dialog";

interface BookingDetailPageProps {
  params: Promise<{ id: string }>;
}

const statusInfo: Record<string, { label: string; color: string; icon: any }> =
  {
    PENDING: {
      label: "대기 중",
      color: "bg-yellow-100 text-yellow-800",
      icon: Clock,
    },
    CONFIRMED: {
      label: "확정됨",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
    },
    CANCELLED: {
      label: "취소됨",
      color: "bg-red-100 text-red-800",
      icon: XCircle,
    },
    COMPLETED: {
      label: "완료됨",
      color: "bg-blue-100 text-blue-800",
      icon: CheckCircle,
    },
    REJECTED: {
      label: "거절됨",
      color: "bg-gray-100 text-gray-800",
      icon: XCircle,
    },
    NO_SHOW: {
      label: "노쇼",
      color: "bg-gray-100 text-gray-800",
      icon: XCircle,
    },
  };

export default async function BookingDetailPage({
  params,
}: BookingDetailPageProps) {
  const authUser = await getUser();
  const userId = authUser?.profile?.id;

  if (!userId || !authUser) {
    redirect("/login");
  }

  const { id } = await params;

  // Get booking with all details
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      property: {
        include: {
          host: {
            select: {
              contact: true,
            },
          },
        },
      },
      payment: true,
      items: {
        include: {
          experience: true,
        },
      },
      review: true,
    },
  });

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>예약을 찾을 수 없습니다</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              요청하신 예약 정보를 찾을 수 없습니다.
            </p>
            <Link href="/profile/bookings">
              <Button>내 예약으로 돌아가기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check ownership
  if (booking.userId !== userId) {
    redirect("/profile/bookings");
  }

  const StatusIcon = statusInfo[booking.status]?.icon || Clock;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/profile/bookings">
            <Button variant="ghost" size="sm" className="mb-4">
              ← 내 예약으로
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                예약 상세
              </h1>
              <p className="text-gray-600">
                예약번호: {booking.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <Badge
              className={`${statusInfo[booking.status]?.color} px-4 py-2 text-base`}
              variant="secondary"
            >
              <StatusIcon className="w-4 h-4 mr-2" />
              {statusInfo[booking.status]?.label || booking.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Info */}
            <Card>
              <CardHeader>
                <CardTitle>숙소 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link
                  href={`/property/${booking.property.id}`}
                  className="block hover:opacity-80 transition"
                >
                  <div className="flex items-start gap-4">
                    {booking.property.thumbnailUrl && (
                      <img
                        src={booking.property.thumbnailUrl}
                        alt={booking.property.name}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">
                        {booking.property.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {booking.property.address}
                      </div>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {booking.property.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>

            {/* Booking Details */}
            <Card>
              <CardHeader>
                <CardTitle>예약 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      체크인
                    </div>
                    <p className="font-medium">
                      {format(new Date(booking.checkIn), "PPP (eee)", {
                        locale: ko,
                      })}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      체크아웃
                    </div>
                    <p className="font-medium">
                      {format(new Date(booking.checkOut), "PPP (eee)", {
                        locale: ko,
                      })}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    게스트 인원
                  </div>
                  <p className="font-medium">{booking.guests}명</p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-gray-600">숙박 일수</p>
                  <p className="font-medium">{booking.numberOfNights}박</p>
                </div>

                {booking.specialRequests && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-gray-600 mb-2">특별 요청사항</p>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {booking.specialRequests}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Experience Items */}
            {booking.items && booking.items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>추가 체험</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {booking.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{item.experience.name}</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(item.date), "PPP", { locale: ko })} •{" "}
                            {item.time} • {item.quantity}명
                          </p>
                        </div>
                        <p className="font-medium">
                          ₩
                          {(typeof item.totalPrice === "number"
                            ? item.totalPrice
                            : item.totalPrice.toNumber()
                          ).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status Messages */}
            {booking.status === "PENDING" && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 text-yellow-800 bg-yellow-50 p-4 rounded-lg">
                    <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">호스트 확인 대기 중</p>
                      <p className="text-sm mt-1">
                        호스트가 예약을 확인하고 있습니다. 확정되면 알림을
                        보내드립니다.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {booking.status === "CONFIRMED" && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 text-green-800 bg-green-50 p-4 rounded-lg">
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">예약이 확정되었습니다</p>
                      <p className="text-sm mt-1">
                        체크인 날짜에 맞춰 방문해주세요. 즐거운 여행 되세요!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {booking.rejectionReason && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">예약 거절 안내</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-gray-900 mb-2">
                      {booking.rejectionReason}
                    </p>
                    {booking.rejectedAt && (
                      <p className="text-sm text-gray-600">
                        거절 일시:{" "}
                        {format(new Date(booking.rejectedAt), "PPP p", {
                          locale: ko,
                        })}
                      </p>
                    )}
                    {booking.payment?.status === "CANCELLED" && (
                      <p className="text-sm text-gray-600 mt-2">
                        결제 금액은 전액 환불되었습니다.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {booking.cancellationReason && (
              <Card>
                <CardHeader>
                  <CardTitle>취소 내역</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 mb-2">
                      {booking.cancellationReason}
                    </p>
                    {booking.cancelledAt && (
                      <p className="text-sm text-gray-600">
                        취소 일시:{" "}
                        {format(new Date(booking.cancelledAt), "PPP p", {
                          locale: ko,
                        })}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Host Contact */}
            <Card>
              <CardHeader>
                <CardTitle>호스트 연락처</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Phone className="w-4 h-4 mr-2" />
                    전화번호
                  </div>
                  <a
                    href={`tel:${booking.property.host.contact}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {booking.property.host.contact}
                  </a>
                </div>
                <p className="text-xs text-gray-500">
                  * 예약 관련 문의사항이 있으시면 호스트에게 직접 연락해주세요.
                </p>
              </CardContent>
            </Card>

            {/* Guest Info */}
            <Card>
              <CardHeader>
                <CardTitle>예약자 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">이름</p>
                  <p className="font-medium">{booking.guestName}</p>
                </div>
                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Phone className="w-4 h-4 mr-2" />
                    전화번호
                  </div>
                  <p className="font-medium">{booking.guestPhone}</p>
                </div>
                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Mail className="w-4 h-4 mr-2" />
                    이메일
                  </div>
                  <p className="font-medium break-all">{booking.guestEmail}</p>
                </div>
              </CardContent>
            </Card>

            {/* Price Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  결제 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>
                    ₩
                    {(typeof booking.nightlyRate === "number"
                      ? booking.nightlyRate
                      : booking.nightlyRate.toNumber()
                    ).toLocaleString()}{" "}
                    × {booking.numberOfNights}박
                  </span>
                  <span>
                    ₩
                    {(typeof booking.accommodationTotal === "number"
                      ? booking.accommodationTotal
                      : booking.accommodationTotal.toNumber()
                    ).toLocaleString()}
                  </span>
                </div>

                {booking.items && booking.items.length > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span>체험 비용</span>
                    <span>
                      ₩
                      {(typeof booking.experiencesTotal === "number"
                        ? booking.experiencesTotal
                        : booking.experiencesTotal.toNumber()
                      ).toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span>서비스 수수료</span>
                  <span>
                    ₩
                    {(typeof booking.serviceFee === "number"
                      ? booking.serviceFee
                      : booking.serviceFee.toNumber()
                    ).toLocaleString()}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between font-bold text-lg">
                  <span>총 결제 금액</span>
                  <span>
                    ₩
                    {(typeof booking.totalAmount === "number"
                      ? booking.totalAmount
                      : booking.totalAmount.toNumber()
                    ).toLocaleString()}
                  </span>
                </div>

                {booking.payment && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">결제 상태</span>
                      <Badge
                        variant={
                          booking.payment.status === "DONE"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {booking.payment.status === "DONE"
                          ? "결제 완료"
                          : booking.payment.status === "CANCELLED"
                          ? "환불됨"
                          : booking.payment.status}
                      </Badge>
                    </div>
                    {booking.payment.paymentMethod && (
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-gray-600">결제 방법</span>
                        <span>{booking.payment.paymentMethod}</span>
                      </div>
                    )}
                    {booking.payment.refundedAt && (
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-gray-600">환불 일시</span>
                        <span>
                          {format(
                            new Date(booking.payment.refundedAt),
                            "PPP",
                            { locale: ko }
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Cancellation Button */}
                {booking.payment &&
                  booking.payment.status === "DONE" &&
                  (booking.status === "CONFIRMED" || booking.status === "PENDING") &&
                  new Date(booking.checkIn) > new Date() && (
                    <div className="mt-4 pt-4 border-t">
                      <RefundDialog
                        paymentId={booking.payment.id}
                        amount={
                          typeof booking.totalAmount === "number"
                            ? booking.totalAmount
                            : booking.totalAmount.toNumber()
                        }
                        trigger={
                          <Button variant="destructive" className="w-full">
                            예약 취소
                          </Button>
                        }
                      />
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* Actions */}
            {booking.status === "COMPLETED" && !booking.review && (
              <Card>
                <CardHeader>
                  <CardTitle>리뷰 작성</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    숙박 경험은 어떠셨나요? 리뷰를 남겨주세요!
                  </p>
                  <ReviewDialog
                    bookingId={booking.id}
                    propertyId={booking.property.id}
                    propertyName={booking.property.name}
                    trigger={<Button className="w-full">리뷰 작성하기</Button>}
                  />
                </CardContent>
              </Card>
            )}

            {/* Timestamps */}
            <Card>
              <CardHeader>
                <CardTitle>예약 기록</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">예약 생성</span>
                  <span>
                    {format(new Date(booking.createdAt), "PPP p", {
                      locale: ko,
                    })}
                  </span>
                </div>
                {booking.confirmedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">예약 확정</span>
                    <span>
                      {format(new Date(booking.confirmedAt), "PPP p", {
                        locale: ko,
                      })}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
