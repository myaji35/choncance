import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/admin-auth";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Users } from "lucide-react";
import { HostApproveButton, HostRejectButton } from "./approve-button";

export default async function AdminHostsPage() {
  await requireAdminAuth();

  let hostProfiles: any[] = [];
  let pendingCount = 0;
  let approvedCount = 0;
  let rejectedCount = 0;

  try {
    hostProfiles = await prisma.hostProfile.findMany({
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
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    pendingCount = hostProfiles.filter((h) => h.status === "PENDING").length;
    approvedCount = hostProfiles.filter((h) => h.status === "APPROVED").length;
    rejectedCount = hostProfiles.filter((h) => h.status === "REJECTED").length;
  } catch (error) {
    console.error("Failed to fetch host profiles:", error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              대시보드
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#16325C]">호스트 관리</h1>
            <p className="text-gray-600 mt-1">
              호스트 신청을 검토하고 승인/거부할 수 있습니다
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">전체 호스트</p>
                <p className="text-2xl font-bold">{hostProfiles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">승인 대기</p>
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">승인됨</p>
            <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">거부됨</p>
            <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Hosts Section */}
      {pendingCount > 0 && (
        <Card className="mb-8 border-amber-200">
          <CardHeader className="bg-amber-50 border-b border-amber-200">
            <CardTitle className="text-lg text-amber-900">
              승인 대기 호스트 ({pendingCount}건)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>연락처</TableHead>
                  <TableHead>사업자번호</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hostProfiles
                  .filter((h) => h.status === "PENDING")
                  .map((host) => (
                    <TableRow key={host.id}>
                      <TableCell className="font-medium">
                        {host.user.name || "-"}
                      </TableCell>
                      <TableCell>{host.user.email || "-"}</TableCell>
                      <TableCell>{host.contact || host.user.phone || "-"}</TableCell>
                      <TableCell>{host.businessNumber || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <HostApproveButton hostId={host.id} hostName={host.user.name || "호스트"} />
                          <HostRejectButton hostId={host.id} hostName={host.user.name || "호스트"} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All Hosts Table */}
      <Card>
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-lg text-[#16325C]">
            전체 호스트 목록
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>사업자번호</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>등록 숙소</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hostProfiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    등록된 호스트가 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                hostProfiles.map((host) => (
                  <TableRow key={host.id}>
                    <TableCell className="font-medium">
                      {host.user.name || "-"}
                    </TableCell>
                    <TableCell>{host.user.email || "-"}</TableCell>
                    <TableCell>{host.contact || host.user.phone || "-"}</TableCell>
                    <TableCell>{host.businessNumber || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          host.status === "APPROVED"
                            ? "default"
                            : host.status === "PENDING"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {host.status === "APPROVED"
                          ? "승인됨"
                          : host.status === "PENDING"
                          ? "대기 중"
                          : "거부됨"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {host.properties.length > 0 ? (
                        <span className="text-sm">
                          {host.properties.length}개
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">없음</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {host.status === "PENDING" && (
                          <>
                            <HostApproveButton hostId={host.id} hostName={host.user.name || "호스트"} />
                            <HostRejectButton hostId={host.id} hostName={host.user.name || "호스트"} />
                          </>
                        )}
                        {host.status === "REJECTED" && (
                          <HostApproveButton hostId={host.id} hostName={host.user.name || "호스트"} />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
