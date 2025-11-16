import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/auth-helpers";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { CancelBookingDialog } from "@/components/booking/cancel-booking-dialog";

async function getBookings(userId: string) {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
            thumbnailUrl: true,
            images: true,
          },
        },
        payment: {
          select: {
            status: true,
            amount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return bookings;
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return [];
  }
}

export default async function BookingsPage() {
  const user = await getUser();

  if (!user || !user.profile) {
    redirect("/login");
  }

  const userId = user.profile.id;
  const bookings = await getBookings(userId);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      COMPLETED: "bg-blue-100 text-blue-800",
      REJECTED: "bg-gray-100 text-gray-800",
      NO_SHOW: "bg-gray-100 text-gray-800",
    };

    const labels: Record<string, string> = {
      PENDING: "결제 대기",
      CONFIRMED: "예약 확정",
      CANCELLED: "취소됨",
      COMPLETED: "완료",
      REJECTED: "거절됨",
      NO_SHOW: "노쇼",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.PENDING}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">내 예약</h1>
          <p className="text-gray-600 mt-2">예약 내역을 확인하고 관리하세요</p>
        </div>

        {!bookings || bookings.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-lg text-gray-600 mb-4">아직 예약 내역이 없습니다</p>
              <Link href="/explore">
                <Button>숙소 둘러보기</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking: any) => {
              const checkIn = new Date(booking.checkIn);
              const checkOut = new Date(booking.checkOut);
              const imageUrl = booking.property.thumbnailUrl || booking.property.images[0] || "/placeholder-property.jpg";

              return (
                <Card key={booking.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
                      {/* Property Image */}
                      <div className="relative aspect-[4/3] md:aspect-auto md:h-full">
                        <Image
                          src={imageUrl}
                          alt={booking.property.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Booking Details */}
                      <div className="md:col-span-3 p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-xl font-bold text-gray-900">
                                {booking.property.name}
                              </h3>
                              {getStatusBadge(booking.status)}
                            </div>

                            <div className="flex items-center gap-2 text-gray-600 mb-4">
                              <MapPin className="w-4 h-4" />
                              <span className="text-sm">{booking.property.address}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600 mb-1">체크인</p>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <span className="font-medium">
                                    {format(checkIn, "PPP", { locale: ko })}
                                  </span>
                                </div>
                              </div>

                              <div>
                                <p className="text-gray-600 mb-1">체크아웃</p>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <span className="font-medium">
                                    {format(checkOut, "PPP", { locale: ko })}
                                  </span>
                                </div>
                              </div>

                              <div>
                                <p className="text-gray-600 mb-1">게스트</p>
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-gray-500" />
                                  <span className="font-medium">{booking.guests}명</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="md:text-right">
                            <p className="text-sm text-gray-600 mb-1">총 금액</p>
                            <p className="text-2xl font-bold text-gray-900">
                              ₩{Number(booking.totalAmount).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {booking.numberOfNights}박
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4 border-t">
                          <Link href={`/bookings/${booking.id}`} className="flex-1 md:flex-initial">
                            <Button variant="outline" className="w-full">
                              상세보기
                            </Button>
                          </Link>

                          {booking.status === "CONFIRMED" && (
                            <CancelBookingDialog
                              bookingId={booking.id}
                              checkInDate={checkIn}
                              totalAmount={Number(booking.totalAmount)}
                            >
                              <Button variant="outline" className="text-red-600 hover:text-red-700">
                                취소하기
                              </Button>
                            </CancelBookingDialog>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
