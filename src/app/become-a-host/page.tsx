import { getUser } from "@/lib/supabase/auth-helpers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BecomeHostForm } from "@/components/host/become-host-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default async function BecomeHostPage() {
  const authUser = await getUser();
  const userId = authUser?.profile?.id;

  if (!userId || !authUser) {
    redirect("/login");
  }

  // Check if user already has a host profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { hostProfile: true },
  });

  // If already a host, redirect to dashboard
  if (user?.hostProfile) {
    redirect("/host/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            촌캉스 호스트가 되어보세요
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            당신의 공간을 특별한 경험으로 공유하고,
            게스트에게 진정한 쉼을 선물하세요
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CheckCircle2 className="w-12 h-12 text-primary mb-2" />
              <CardTitle>추가 수익 창출</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                빈 공간을 활용하여 안정적인 수익을 만들어보세요.
                촌캉스만의 프리미엄 가격 책정이 가능합니다.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle2 className="w-12 h-12 text-primary mb-2" />
              <CardTitle>간편한 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                직관적인 대시보드로 예약, 일정, 수익을 한눈에 관리하세요.
                24/7 호스트 지원팀이 함께합니다.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle2 className="w-12 h-12 text-primary mb-2" />
              <CardTitle>의미있는 연결</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                당신의 공간과 이야기를 통해 게스트에게 특별한 추억을 선물하고,
                진정한 촌캉스 문화를 만들어가세요.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Application Form */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>호스트 신청하기</CardTitle>
            <CardDescription>
              아래 정보를 입력하시면 검토 후 24시간 내 연락드리겠습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BecomeHostForm />
          </CardContent>
        </Card>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">자주 묻는 질문</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">호스트 승인은 얼마나 걸리나요?</h3>
              <p className="text-gray-600">
                신청서 제출 후 24시간 내에 검토가 완료되며, 승인 여부를 이메일로 안내드립니다.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">수수료는 얼마인가요?</h3>
              <p className="text-gray-600">
                촌캉스는 예약 금액의 10%를 서비스 수수료로 받고 있습니다.
                투명하고 합리적인 가격 정책을 유지합니다.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">어떤 공간도 등록할 수 있나요?</h3>
              <p className="text-gray-600">
                농촌, 시골 지역의 숙소라면 한옥, 펜션, 민박, 글램핑 등 모든 형태가 가능합니다.
                단, 안전 기준과 기본 시설 요건을 충족해야 합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
