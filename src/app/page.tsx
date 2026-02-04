import { redirect } from "next/navigation";
import { getCurrentUser, getRoleHomePage } from "@/lib/auth-utils";
import { LandingPageClient } from "@/components/landing-page-client";

export default async function LandingPage() {
  // 로그인한 사용자 확인
  const user = await getCurrentUser();

  // 로그인한 사용자인 경우 역할에 따라 대시보드로 리디렉션
  if (user) {
    const homePage = getRoleHomePage(user.role);
    redirect(homePage);
  }

  // 로그인하지 않은 사용자는 메인 페이지 표시
  return <LandingPageClient />;
}
