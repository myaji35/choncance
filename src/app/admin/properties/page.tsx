import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/admin-auth";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AdminPropertiesPage() {
  // Admin token으로 인증 확인
  await requireAdminAuth();

  // Get all properties with host information
  let properties: any[] = [];

  try {
    properties = await prisma.property.findMany({
      include: {
        host: {
          select: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (e) {
    console.error("Failed to fetch properties:", e);
    // Silently handle error - show empty state
    properties = [];
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">전체 숙소 관리</h1>
        <div className="flex gap-3">
          <Link href="/admin">
            <Button variant="outline">대시보드로 돌아가기</Button>
          </Link>
          <Link href="/admin/properties/pending">
            <Button>승인 대기 숙소</Button>
          </Link>
        </div>
      </div>


      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">전체 숙소</h3>
          <p className="text-3xl font-bold mt-2">{properties.length}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">승인됨</h3>
          <p className="text-3xl font-bold mt-2 text-green-600">
            {properties.filter((p) => p.status === "APPROVED").length}
          </p>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">대기 중</h3>
          <p className="text-3xl font-bold mt-2 text-yellow-600">
            {properties.filter((p) => p.status === "PENDING").length}
          </p>
        </div>
        <div className="bg-red-50 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">거절됨</h3>
          <p className="text-3xl font-bold mt-2 text-red-600">
            {properties.filter((p) => p.status === "REJECTED").length}
          </p>
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                숙소명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                호스트
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                가격
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                예약/리뷰
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {properties.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  등록된 숙소가 없습니다.
                </td>
              </tr>
            ) : (
              properties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {property.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {property.address}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {property.host.user.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {property.host.user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        property.status === "APPROVED"
                          ? "default"
                          : property.status === "PENDING"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {property.status === "APPROVED"
                        ? "승인됨"
                        : property.status === "PENDING"
                        ? "대기 중"
                        : "거절됨"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ₩{Number(property.pricePerNight).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    예약 {property._count.bookings} / 리뷰{" "}
                    {property._count.reviews}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex gap-2">
                      <Link href={`/property/${property.id}`}>
                        <Button variant="outline" size="sm">
                          보기
                        </Button>
                      </Link>
                      {property.status === "PENDING" && (
                        <Link href={`/admin/properties/pending`}>
                          <Button size="sm">검토</Button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Filter by Status */}
      <div className="mt-6 flex gap-2">
        <Link href="/admin/properties">
          <Button variant="outline">전체</Button>
        </Link>
        <Link href="/admin/properties?status=APPROVED">
          <Button variant="outline">승인됨만</Button>
        </Link>
        <Link href="/admin/properties?status=PENDING">
          <Button variant="outline">대기 중만</Button>
        </Link>
        <Link href="/admin/properties?status=REJECTED">
          <Button variant="outline">거절됨만</Button>
        </Link>
      </div>
    </div>
  );
}
