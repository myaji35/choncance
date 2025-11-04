import { NextRequest, NextResponse } from "next/server";
import { qrLoginStore } from "@/lib/qr-login-store";
import { SignJWT } from "jose";

export const dynamic = "force-dynamic";

// GET /api/admin/qr-login/status?sessionId=xxx - Check login status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "세션 ID가 필요합니다" },
        { status: 400 }
      );
    }

    const session = qrLoginStore.getSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { authenticated: false, expired: true },
        { status: 200 }
      );
    }

    if (!session.authenticated) {
      return NextResponse.json(
        { authenticated: false, expired: false },
        { status: 200 }
      );
    }

    // Session is authenticated - generate JWT token
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "choncance-secret-key-change-in-production"
    );

    const token = await new SignJWT({
      userId: session.userId,
      phone: session.phone,
      role: "ADMIN",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret);

    // Delete session after successful login
    qrLoginStore.deleteSession(sessionId);

    return NextResponse.json({
      authenticated: true,
      token,
      userId: session.userId,
    });
  } catch (error) {
    console.error("Failed to check login status:", error);
    return NextResponse.json(
      { error: "상태 확인에 실패했습니다" },
      { status: 500 }
    );
  }
}
