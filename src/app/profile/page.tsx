import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  User,
  Mail,
  Calendar,
  Heart,
  BookOpen,
  Home,
  Settings,
} from "lucide-react";

export default async function ProfilePage() {
  const authUser = await getUser();

  if (!authUser || !authUser.profile) {
    redirect("/login");
  }

  const userId = authUser.profile.id;

  // Get our database user info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      hostProfile: true,
      _count: {
        select: {
          bookings: true,
          wishlists: true,
          reviews: true,
        },
      },
    },
  });

  if (!user) {
    // Create user if doesn't exist
    await prisma.user.create({
      data: {
        id: userId,
        email: authUser.email || "",
        name: authUser.profile?.name || "사용자",
      },
    });
  }

  // Supabase auth user의 created_at 사용
  const joinDate = authUser.profile?.created_at
    ? new Date(authUser.profile.created_at).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "정보 없음";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">프로필</h1>
          <p className="text-gray-600">계정 정보 및 활동 내역을 확인하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  내 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Profile Image */}
                <div className="flex justify-center">
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={user.name || "User"}
                      className="w-24 h-24 rounded-full border-4 border-primary/10"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-12 h-12 text-primary" />
                    </div>
                  )}
                </div>

                {/* User Details */}
                <div className="space-y-3 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {user?.name || "사용자"}
                    </p>
                    {user?.hostProfile && (
                      <Badge className="mt-2" variant="secondary">
                        호스트
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    {user?.email || authUser.email}
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    가입일: {joinDate}
                  </div>
                </div>

                {/* Edit Profile Button */}
                <Link href="/profile/settings">
                  <Button variant="outline" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    프로필 편집
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Host Status Card */}
            {user?.hostProfile ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    호스트 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">상태</p>
                    <Badge
                      variant={
                        user.hostProfile.status === "APPROVED"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {user.hostProfile.status === "APPROVED"
                        ? "승인됨"
                        : user.hostProfile.status === "PENDING"
                        ? "검토 중"
                        : "거부됨"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">사업자 번호</p>
                    <p className="font-medium">{user.hostProfile.businessNumber}</p>
                  </div>
                  <Link href="/host/dashboard">
                    <Button className="w-full mt-4">
                      호스트 대시보드
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>호스트 되기</CardTitle>
                  <CardDescription>
                    당신의 공간을 공유하고 수익을 창출하세요
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/become-a-host">
                    <Button className="w-full">
                      <Home className="w-4 h-4 mr-2" />
                      호스트 신청하기
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Activity Stats & Quick Links */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-3xl font-bold text-gray-900">
                      {user?._count.bookings || 0}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">예약</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Heart className="w-8 h-8 mx-auto mb-2 text-red-500" />
                    <p className="text-3xl font-bold text-gray-900">
                      {user?._count.wishlists || 0}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">찜</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-3xl font-bold text-gray-900">
                      {user?._count.reviews || 0}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">리뷰</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>빠른 링크</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Link href="/profile/bookings">
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="w-4 h-4 mr-2" />
                      내 예약
                    </Button>
                  </Link>

                  <Link href="/wishlist">
                    <Button variant="outline" className="w-full justify-start">
                      <Heart className="w-4 h-4 mr-2" />
                      찜한 숙소
                    </Button>
                  </Link>

                  <Link href="/profile/reviews">
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="w-4 h-4 mr-2" />
                      내 리뷰
                    </Button>
                  </Link>

                  <Link href="/profile/settings">
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      설정
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>최근 활동</CardTitle>
                <CardDescription>
                  최근 예약 및 리뷰 활동을 확인하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <p>최근 활동이 없습니다</p>
                  <Link href="/explore">
                    <Button className="mt-4">
                      숙소 둘러보기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
