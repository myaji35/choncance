import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
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
  ]);

  const [propertyCount, bookingCount, userCount, reviewCount] = stats;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">관리자 대시보드</h1>

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
          <h2 className="text-xl font-bold mb-4">빠른 액세스</h2>
          <div className="space-y-2">
            <a
              href="/host/properties"
              className="block p-3 hover:bg-gray-50 rounded"
            >
              숙소 관리
            </a>
            <a
              href="/host/bookings"
              className="block p-3 hover:bg-gray-50 rounded"
            >
              예약 관리
            </a>
            <a
              href="/host/dashboard"
              className="block p-3 hover:bg-gray-50 rounded"
            >
              호스트 대시보드
            </a>
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
