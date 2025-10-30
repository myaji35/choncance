import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Edit, Eye, Trash2 } from "lucide-react";
import Image from "next/image";

export default async function HostPropertiesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  // Get host profile
  const hostProfile = await prisma.hostProfile.findUnique({
    where: { userId },
  });

  if (!hostProfile) {
    redirect("/become-a-host");
  }

  // Get all properties for this host
  const properties = await prisma.property.findMany({
    where: { hostId: hostProfile.id },
    include: {
      _count: {
        select: {
          bookings: true,
          reviews: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">내 숙소</h1>
          <p className="text-gray-600 mt-2">
            총 {properties.length}개의 숙소를 관리하고 있습니다
          </p>
        </div>
        <Link href="/host/properties/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            새 숙소 등록
          </Button>
        </Link>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <Card className="text-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-gray-100 p-6 rounded-full">
              <Plus className="w-12 h-12 text-gray-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                등록된 숙소가 없습니다
              </h3>
              <p className="text-gray-600 mb-4">
                첫 번째 숙소를 등록하고 게스트를 맞이해보세요
              </p>
              <Link href="/host/properties/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  숙소 등록하기
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              {/* Property Image */}
              <div className="relative h-48 bg-gray-200">
                {property.thumbnailUrl || property.images[0] ? (
                  <Image
                    src={property.thumbnailUrl || property.images[0]}
                    alt={property.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    사진 없음
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      property.status === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : property.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {property.status === "APPROVED"
                      ? "활성"
                      : property.status === "PENDING"
                      ? "검토중"
                      : "비활성"}
                  </span>
                </div>
              </div>

              {/* Property Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{property.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {property.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <span>예약 {property._count.bookings}</span>
                  <span>리뷰 {property._count.reviews}</span>
                  <span className="font-semibold text-gray-900">
                    ₩{property.pricePerNight.toLocaleString()}/박
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/property/${property.id}`}
                    className="flex-1"
                    target="_blank"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-1" />
                      보기
                    </Button>
                  </Link>
                  <Link
                    href={`/host/properties/${property.id}/edit`}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="w-4 h-4 mr-1" />
                      수정
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
