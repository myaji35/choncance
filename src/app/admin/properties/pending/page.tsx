import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdminAuth } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { PropertyApprovalActions } from "./property-approval-actions";

async function getPendingProperties() {
  return prisma.property.findMany({
    where: { status: "PENDING" },
    include: {
      host: {
        include: {
          user: {
            select: { name: true, email: true, phone: true },
          },
        },
      },
      tags: { select: { id: true, name: true, category: true } },
      _count: { select: { bookings: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminPendingPropertiesPage() {
  await requireAdminAuth();

  const properties = await getPendingProperties();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">숙소 승인 대기</h1>
        <p className="text-muted-foreground">
          호스트가 등록한 숙소를 검토하고 승인/거절할 수 있습니다
        </p>
      </div>

      {properties.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">승인 대기중인 숙소가 없습니다</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {properties.map((property) => (
            <Card key={property.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">
                      {property.name}
                    </CardTitle>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>호스트: {property.host.user.name}</p>
                      <p>이메일: {property.host.user.email}</p>
                      {property.host.user.phone && (
                        <p>연락처: {property.host.user.phone}</p>
                      )}
                      <p>
                        등록일:{" "}
                        {new Date(property.createdAt).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{property.status}</Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image */}
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                    {property.thumbnailUrl || property.images[0] ? (
                      <Image
                        src={property.thumbnailUrl || property.images[0]}
                        alt={property.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        이미지 없음
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-1">설명</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {property.description}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-1">위치</h3>
                      <p className="text-sm text-muted-foreground">
                        {property.address}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">가격</p>
                        <p className="font-semibold">
                          ₩{Number(property.pricePerNight).toLocaleString()}/박
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">최대 인원</p>
                        <p className="font-semibold">{property.maxGuests}명</p>
                      </div>
                    </div>

                    {property.tags.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2 text-sm">태그</h3>
                        <div className="flex flex-wrap gap-2">
                          {property.tags.map((tag) => (
                            <Badge key={tag.id} variant="outline">
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <PropertyApprovalActions
                      propertyId={property.id}
                      propertyName={property.name}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
