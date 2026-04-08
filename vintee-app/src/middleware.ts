import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// ISS-025: 공개 호스트 페이지 (가입 전 확인 가능해야 함)
const PUBLIC_HOST_PATHS = ["/host/pricing"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 공개 호스트 페이지는 인증 검사 건너뛰기
  if (PUBLIC_HOST_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const isLoggedIn = !!token;
  const role = token?.role as string | undefined;

  // 보호 라우트: 로그인 필수
  const authRoutes = ["/bookings", "/host"];
  const needsAuth = authRoutes.some((r) => pathname.startsWith(r));

  if (needsAuth && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 호스트 전용 라우트
  if (pathname.startsWith("/host") && role !== "HOST" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/bookings/:path*", "/host/:path*"],
};
