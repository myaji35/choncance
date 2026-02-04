import { redirect } from "next/navigation";
import { getCurrentUser, getRoleHomePage } from "@/lib/auth-utils";
import { Role } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  // 로그인한 사용자 정보 가져오기
  const user = await getCurrentUser();

  // 로그인하지 않은 경우 로그인 페이지로 리디렉션
  if (!user) {
    redirect("/login");
  }

  // 호스트인 경우 호스트 대시보드로 리디렉션
  if (user.role === Role.HOST) {
    redirect("/host/dashboard");
  }

  // 관리자인 경우 관리자 페이지로 리디렉션
  if (user.role === Role.ADMIN) {
    redirect("/admin");
  }

  // 호스트 승인 대기 중인 경우
  if (user.role === Role.HOST_PENDING) {
    redirect("/become-a-host/pending");
  }

  // 일반 사용자(USER)인 경우 아래 대시보드 표시
  // Placeholder for dashboard data
  const todayTasks = 5;
  const inProgressTasks = 12;
  const totalProjects = 3;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">환영합니다, {user.name || user.email}님!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘 마감인 작업</CardTitle>
            {/* Icon can go here */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTasks}개</div>
            <p className="text-xs text-muted-foreground">오늘 처리해야 할 작업</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">진행 중인 작업</CardTitle>
            {/* Icon can go here */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks}개</div>
            <p className="text-xs text-muted-foreground">현재 진행 중인 모든 작업</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 프로젝트 수</CardTitle>
            {/* Icon can go here */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}개</div>
            <p className="text-xs text-muted-foreground">현재 관리 중인 프로젝트</p>
          </CardContent>
        </Card>
      </div>

      {/* Potentially add recent tasks/projects list here */}
    </div>
  );
}
