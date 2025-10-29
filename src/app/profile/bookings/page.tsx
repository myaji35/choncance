import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

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
  };

export default async function MyBookingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  // Get all user bookings
  const allBookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      property: {
        select: {
          id: true,
          name: true,
          address: true,
          thumbnailUrl: true,
          city: true,
          province: true,
        },
      },
      payment: {
        select: {
          status: true,
          amount: true,
        },
      },
      review: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Group bookings by status
  const upcomingBookings = allBookings.filter(
    (b) => b.status === "CONFIRMED" && new Date(b.checkIn) > new Date()
  );

  const pendingBookings = allBookings.filter((b) => b.status === "PENDING");

  const pastBookings = allBookings.filter(
    (b) =>
      b.status === "COMPLETED" ||
      (b.status === "CONFIRMED" && new Date(b.checkOut) < new Date())
  );

  const cancelledBookings = allBookings.filter(
    (b) => b.status === "CANCELLED" || b.status === "REJECTED"
  );

  const renderBookingCard = (booking: typeof allBookings[0]) => {
    const StatusIcon = statusInfo[booking.status]?.icon || Clock;

    return (
      <Link key={booking.id} href={`/bookings/${booking.id}`}>
        <Card className="hover:shadow-md transition cursor-pointer">
          <CardContent className="p-6">
            <div className="flex gap-4">
              {/* Property Image */}
              {booking.property.thumbnailUrl && (
                <img
                  src={booking.property.thumbnailUrl}
                  alt={booking.property.name}
                  className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                />
              )}

              {/* Booking Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {booking.property.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <MapPin className="w-4 h-4" />
                      {booking.property.city}, {booking.property.province}
                    </div>
                  </div>
                  <Badge
                    className={statusInfo[booking.status]?.color}
                    variant="secondary"
                  >
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusInfo[booking.status]?.label}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      체크인
                    </div>
                    <p className="font-medium mt-1">
                      {format(new Date(booking.checkIn), "M월 d일 (eee)", {
                        locale: ko,
                      })}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      체크아웃
                    </div>
                    <p className="font-medium mt-1">
                      {format(new Date(booking.checkOut), "M월 d일 (eee)", {
                        locale: ko,
                      })}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      게스트
                    </div>
                    <p className="font-medium mt-1">{booking.guests}명</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    예약 번호: {booking.id.slice(0, 8).toUpperCase()}
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    ₩
                    {(typeof booking.totalAmount === "number"
                      ? booking.totalAmount
                      : booking.totalAmount.toNumber()
                    ).toLocaleString()}
                  </div>
                </div>

                {/* Action Buttons */}
                {booking.status === "COMPLETED" && !booking.review && (
                  <div className="mt-4">
                    <Button size="sm" className="w-full md:w-auto">
                      리뷰 작성하기
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="mb-4">
              ← 프로필로 돌아가기
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">내 예약</h1>
          <p className="text-gray-600">예약 내역을 확인하고 관리하세요</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upcoming">
              다가오는 예약 ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              대기 중 ({pendingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              완료됨 ({pastBookings.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              취소됨 ({cancelledBookings.length})
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Bookings */}
          <TabsContent value="upcoming" className="space-y-4">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map(renderBookingCard)
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">
                    다가오는 예약이 없습니다
                  </p>
                  <Link href="/explore">
                    <Button>숙소 둘러보기</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Pending Bookings */}
          <TabsContent value="pending" className="space-y-4">
            {pendingBookings.length > 0 ? (
              pendingBookings.map(renderBookingCard)
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">대기 중인 예약이 없습니다</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Past Bookings */}
          <TabsContent value="past" className="space-y-4">
            {pastBookings.length > 0 ? (
              pastBookings.map(renderBookingCard)
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">완료된 예약이 없습니다</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Cancelled Bookings */}
          <TabsContent value="cancelled" className="space-y-4">
            {cancelledBookings.length > 0 ? (
              cancelledBookings.map(renderBookingCard)
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <XCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">취소된 예약이 없습니다</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
