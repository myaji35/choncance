import { getUser } from "@/lib/supabase/auth-helpers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { HostProfileEditForm } from "@/components/host/host-profile-edit-form";

export default async function HostProfileEditPage() {
  const user = await getUser();
  const userId = user?.profile?.id;

  if (!userId || !user) {
    redirect("/login");
  }

  // Get host profile
  const hostProfile = await prisma.hostProfile.findUnique({
    where: { userId },
  });

  if (!hostProfile) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>호스트 프로필 없음</CardTitle>
            <CardDescription>
              호스트로 등록되지 않았습니다.
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/host/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              대시보드로 돌아가기
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            호스트 프로필 편집
          </h1>
          <p className="text-gray-600">호스트 정보를 수정하세요</p>
        </div>

        {/* Edit Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>
              사업자 번호와 연락처를 수정할 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HostProfileEditForm
              initialData={{
                businessNumber: hostProfile.businessNumber,
                contact: hostProfile.contact,
              }}
            />
          </CardContent>
        </Card>

        {/* Status Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>승인 상태</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">현재 상태</span>
              <span className="font-semibold">
                {hostProfile.status === "APPROVED"
                  ? "✅ 승인됨"
                  : hostProfile.status === "PENDING"
                  ? "⏳ 검토 중"
                  : "❌ 거부됨"}
              </span>
            </div>
            {hostProfile.status === "PENDING" && (
              <p className="text-sm text-gray-500 mt-2">
                호스트 승인이 완료되면 숙소를 등록하고 예약을 받을 수 있습니다.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
