"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Eye, Loader2 } from "lucide-react";

interface Property {
  id: string;
  name: string;
  description: string;
  address: string;
  pricePerNight: number;
  maxGuests: number;
  images: string[];
  thumbnailUrl: string | null;
  status: string;
  createdAt: string;
  host: {
    user: {
      name: string;
      email: string;
      phone: string | null;
    };
  };
  tags: Array<{
    id: string;
    name: string;
    category: string;
  }>;
  _count: {
    bookings: number;
    reviews: number;
  };
}

export default function AdminPendingPropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/properties?status=PENDING`
      );

      if (!response.ok) {
        if (response.status === 403) {
          alert("관리자 권한이 필요합니다");
          router.push("/");
          return;
        }
        throw new Error("Failed to fetch properties");
      }

      const data = await response.json();
      setProperties(data.properties);
    } catch (error) {
      console.error("Failed to fetch properties:", error);
      alert("숙소 목록을 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (propertyId: string) => {
    if (!confirm("이 숙소를 승인하시겠습니까?")) {
      return;
    }

    setProcessingIds((prev) => new Set(prev).add(propertyId));

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/properties/${propertyId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "APPROVED" }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to approve property");
      }

      alert("숙소가 승인되었습니다");
      // Remove from list
      setProperties((prev) => prev.filter((p) => p.id !== propertyId));
    } catch (error) {
      console.error("Failed to approve property:", error);
      alert("숙소 승인에 실패했습니다");
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(propertyId);
        return next;
      });
    }
  };

  const handleReject = async (propertyId: string) => {
    const reason = prompt("거절 사유를 입력해주세요:");
    if (!reason) {
      return;
    }

    setProcessingIds((prev) => new Set(prev).add(propertyId));

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/properties/${propertyId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "REJECTED", rejectionReason: reason }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject property");
      }

      alert("숙소가 거절되었습니다");
      // Remove from list
      setProperties((prev) => prev.filter((p) => p.id !== propertyId));
    } catch (error) {
      console.error("Failed to reject property:", error);
      alert("숙소 거절에 실패했습니다");
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(propertyId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
          {properties.map((property) => {
            const isProcessing = processingIds.has(property.id);

            return (
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
                          {new Date(property.createdAt).toLocaleDateString(
                            "ko-KR"
                          )}
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
                            ₩{Number(property.pricePerNight).toLocaleString()}
                            /박
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">최대 인원</p>
                          <p className="font-semibold">
                            {property.maxGuests}명
                          </p>
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

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/property/${property.id}`)
                          }
                          disabled={isProcessing}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          상세보기
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApprove(property.id)}
                          disabled={isProcessing}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 mr-2" />
                          )}
                          승인
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(property.id)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <X className="h-4 w-4 mr-2" />
                          )}
                          거절
                        </Button>
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
  );
}
