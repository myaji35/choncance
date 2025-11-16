import { getUser } from "@/lib/supabase/auth-helpers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingManagementTable } from "@/components/host/booking-management-table";
import { prisma } from "@/lib/prisma";

interface SearchParams {
  propertyId?: string;
  status?: string;
  page?: string;
}

interface HostBookingsPageProps {
  searchParams: SearchParams;
}

async function getHostBookings(
  hostId: string,
  searchParams: SearchParams
) {
  const propertyId = searchParams.propertyId;
  const status = searchParams.status;
  const page = parseInt(searchParams.page || "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Record<string, unknown> = {
    property: {
      hostId,
    },
  };

  if (propertyId) {
    where.propertyId = propertyId;
  }

  if (status) {
    where.status = status;
  }

  const [bookings, total, stats] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
            thumbnailUrl: true,
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
      skip,
      take: limit,
    }),
    prisma.booking.count({ where }),
    prisma.booking.groupBy({
      by: ["status"],
      where: {
        property: {
          hostId,
        },
      },
      _count: {
        id: true,
      },
    }),
  ]);

  const statusCounts = stats.reduce((acc, stat) => {
    acc[stat.status] = stat._count.id;
    return acc;
  }, {} as Record<string, number>);

  return {
    bookings,
    stats: statusCounts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getHostProperties(hostId: string) {
  return prisma.property.findMany({
    where: { hostId },
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });
}

export default async function HostBookingsPage({
  searchParams,
}: HostBookingsPageProps) {
  const user = await getUser();
  const userId = user?.profile?.id;

  if (!userId || !user) {
    redirect("/login");
  }

  // Check if user is a host
  const hostProfile = await prisma.hostProfile.findUnique({
    where: { userId },
  });

  if (!hostProfile) {
    redirect("/");
  }

  const [bookingsData, properties] = await Promise.all([
    getHostBookings(hostProfile.id, searchParams),
    getHostProperties(hostProfile.id),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            예약 관리
          </h1>
          <p className="text-gray-600">
            숙소에 대한 예약을 확인하고 관리하세요
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                대기 중
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bookingsData.stats.PENDING || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                확정됨
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bookingsData.stats.CONFIRMED || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                완료됨
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bookingsData.stats.COMPLETED || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                취소/거절
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(bookingsData.stats.CANCELLED || 0) + (bookingsData.stats.REJECTED || 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle>예약 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingManagementTable
              bookings={bookingsData.bookings}
              properties={properties}
              pagination={bookingsData.pagination}
              currentFilters={{
                propertyId: searchParams.propertyId,
                status: searchParams.status,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
