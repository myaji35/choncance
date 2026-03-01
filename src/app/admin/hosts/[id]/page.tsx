import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/admin-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2, Mail, Phone, User } from "lucide-react";
import { HostApproveButton, HostRejectButton } from "../approve-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminHostDetailPage({ params }: PageProps) {
  await requireAdminAuth();

  const { id } = await params;

  const host = await prisma.hostProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
        },
      },
      properties: {
        select: {
          id: true,
          name: true,
          status: true,
          address: true,
          pricePerNight: true,
        },
        orderBy: { id: "desc" },
      },
    },
  });

  if (!host) notFound();

  const statusColor =
    host.status === "APPROVED"
      ? "default"
      : host.status === "PENDING"
      ? "secondary"
      : "destructive";

  const statusLabel =
    host.status === "APPROVED" ? "승인됨" : host.status === "PENDING" ? "대기 중" : "거부됨";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/hosts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            호스트 목록
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#16325C]">
            호스트 상세 정보
          </h1>
        </div>
        <Badge variant={statusColor}>{statusLabel}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 신청자 정보 */}
        <Card>
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              신청자 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">이름</p>
                <p className="font-medium">{host.user.name || "-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">이메일</p>
                <p className="font-medium">{host.user.email || "-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">연락처</p>
                <p className="font-medium">{host.contact || host.user.phone || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 호스트 신청 정보 */}
        <Card>
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              호스트 신청 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div>
              <p className="text-xs text-gray-500">사업자번호</p>
              <p className="font-medium">{host.businessNumber || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">현재 상태</p>
              <Badge variant={statusColor} className="mt-1">{statusLabel}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 등록 숙소 */}
      <Card className="mt-6">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            등록 숙소 ({host.properties.length}개)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {host.properties.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">등록된 숙소가 없습니다</p>
          ) : (
            <div className="space-y-3">
              {host.properties.map((property) => (
                <div
                  key={property.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{property.name}</p>
                    <p className="text-xs text-gray-500">{property.address}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      ₩{property.pricePerNight.toLocaleString()}/박
                    </span>
                    <Badge
                      variant={
                        property.status === "APPROVED"
                          ? "default"
                          : property.status === "PENDING"
                          ? "secondary"
                          : "destructive"
                      }
                      className="text-xs"
                    >
                      {property.status === "APPROVED"
                        ? "승인됨"
                        : property.status === "PENDING"
                        ? "대기 중"
                        : "거절됨"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 작업 버튼 */}
      {(host.status === "PENDING" || host.status === "REJECTED") && (
        <div className="mt-6 flex gap-3 justify-end">
          {host.status === "PENDING" && (
            <>
              <HostRejectButton hostId={host.id} hostName={host.user.name || "호스트"} />
              <HostApproveButton hostId={host.id} hostName={host.user.name || "호스트"} />
            </>
          )}
          {host.status === "REJECTED" && (
            <HostApproveButton hostId={host.id} hostName={host.user.name || "호스트"} />
          )}
        </div>
      )}
    </div>
  );
}
