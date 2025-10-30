import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Plus, Home, Calendar, Settings, BarChart3 } from "lucide-react";
import { PropertyListTable } from "@/components/host/property-list-table";
import { BookingListTable } from "@/components/host/booking-list-table";
import { DashboardStats } from "@/components/host/dashboard-stats";
import { BookingCalendar } from "@/components/host/booking-calendar";

export default async function HostDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  // Get user and host profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      hostProfile: {
        include: {
          properties: {
            include: {
              tags: true,
              bookings: {
                where: {
                  status: {
                    in: ["PENDING", "CONFIRMED"],
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user?.hostProfile) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>호스트 등록 필요</CardTitle>
            <CardDescription>
              호스트 대시보드를 이용하려면 먼저 호스트로 등록해야 합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/become-a-host">
              <Button>호스트 등록하기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hostProfile = user.hostProfile;
  const properties = hostProfile.properties;

  // Calculate stats
  const totalProperties = properties.length;
  const activeProperties = properties.filter((p) => p.status === "APPROVED").length;
  const pendingProperties = properties.filter((p) => p.status === "PENDING").length;
  const totalBookings = properties.reduce((sum, p) => sum + p.bookings.length, 0);

  // Get recent bookings
  const recentBookings = await prisma.booking.findMany({
    where: {
      property: {
        hostId: hostProfile.id,
      },
    },
    include: {
      property: {
        select: {
          name: true,
          thumbnailUrl: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">호스트 대시보드</h1>
          <p className="text-gray-600 mt-1">
            환영합니다, {user.name || user.email}님
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/host/stats">
            <Button size="lg" variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              통계 보기
            </Button>
          </Link>
          <Link href="/host/properties/new">
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              숙소 등록하기
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <DashboardStats
        totalProperties={totalProperties}
        activeProperties={activeProperties}
        pendingProperties={pendingProperties}
        totalBookings={totalBookings}
      />

      {/* Tabs */}
      <Tabs defaultValue="properties" className="mt-8">
        <TabsList>
          <TabsTrigger value="properties">
            <Home className="mr-2 h-4 w-4" />
            내 숙소
          </TabsTrigger>
          <TabsTrigger value="bookings">
            <Calendar className="mr-2 h-4 w-4" />
            예약 관리
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            설정
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>내 숙소 목록</CardTitle>
              <CardDescription>
                등록한 숙소를 관리하고 수정할 수 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PropertyListTable properties={properties} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="mt-6">
          <div className="space-y-6">
            {/* Calendar View */}
            <BookingCalendar />

            {/* Recent Bookings Table */}
            <Card>
              <CardHeader>
                <CardTitle>최근 예약</CardTitle>
                <CardDescription>
                  숙소에 대한 예약을 확인하고 관리할 수 있습니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BookingListTable bookings={recentBookings} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>호스트 프로필 설정</CardTitle>
              <CardDescription>
                호스트 정보를 수정할 수 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">사업자 번호</label>
                  <p className="text-gray-600">{hostProfile.businessNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">연락처</label>
                  <p className="text-gray-600">{hostProfile.contact}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">승인 상태</label>
                  <p className="text-gray-600">
                    {hostProfile.status === "APPROVED"
                      ? "승인됨"
                      : hostProfile.status === "PENDING"
                      ? "검토 중"
                      : "거부됨"}
                  </p>
                </div>
                <Link href="/host/profile/edit">
                  <Button variant="outline">프로필 수정</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
