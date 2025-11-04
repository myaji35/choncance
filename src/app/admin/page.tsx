import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck } from "lucide-react";

export default async function AdminPage() {
  // ADMIN 역할만 접근 가능
  await requireAdmin();

  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  // Get current user from Clerk
  const clerkUser = await currentUser();

  // Get statistics
  const stats = await Promise.all([
    prisma.property.count(),
    prisma.booking.count(),
    prisma.user.count(),
    prisma.review.count(),
    prisma.property.count({ where: { status: "PENDING" } }),
  ]);

  const [propertyCount, bookingCount, userCount, reviewCount, pendingPropertiesCount] = stats;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">관리자 대시보드</h1>

      {/* Pending Properties Alert */}
      {pendingPropertiesCount > 0 && (
        <Link href="/admin/properties/pending">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 mb-8 hover:bg-amber-100 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-amber-500 text-white p-3 rounded-full">
                  <ClipboardCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-900">
                    검토 대기중인 숙소가 있습니다
                  </h3>
                  <p className="text-amber-700 text-sm">
                    호스트가 등록한 숙소를 승인하거나 거절해주세요
                  </p>
                </div>
              </div>
              <Badge variant="destructive" className="text-lg px-4 py-2">
                {pendingPropertiesCount}개 대기중
              </Badge>
            </div>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">총 숙소</h3>
          <p className="text-3xl font-bold mt-2">{propertyCount}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">총 예약</h3>
          <p className="text-3xl font-bold mt-2">{bookingCount}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">총 회원</h3>
          <p className="text-3xl font-bold mt-2">{userCount}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">총 리뷰</h3>
          <p className="text-3xl font-bold mt-2">{reviewCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">관리자 메뉴</h2>
          <div className="space-y-2">
            <Link
              href="/admin/properties/pending"
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded transition-colors"
            >
              <span>숙소 승인 관리</span>
              {pendingPropertiesCount > 0 && (
                <Badge variant="destructive">{pendingPropertiesCount}</Badge>
              )}
            </Link>
            <Link
              href="/admin/properties"
              className="block p-3 hover:bg-gray-50 rounded transition-colors"
            >
              전체 숙소 조회
            </Link>
            <Link
              href="/admin/users"
              className="block p-3 hover:bg-gray-50 rounded transition-colors"
            >
              회원 관리
            </Link>
            <Link
              href="/admin/hosts"
              className="block p-3 hover:bg-gray-50 rounded transition-colors"
            >
              호스트 관리
            </Link>
            <Link
              href="/admin/reports"
              className="block p-3 hover:bg-gray-50 rounded transition-colors"
            >
              통계 및 리포트
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">관리자 정보</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">이메일:</span>{" "}
              {clerkUser?.emailAddresses[0]?.emailAddress || "N/A"}
            </p>
            <p>
              <span className="font-medium">이름:</span>{" "}
              {clerkUser?.firstName || clerkUser?.username || "N/A"}
            </p>
            <p>
              <span className="font-medium">사용자 ID:</span> {userId}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
