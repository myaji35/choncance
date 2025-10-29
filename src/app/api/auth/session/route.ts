import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export const dynamic = 'force-dynamic';

// GET /api/auth/session - 현재 사용자 세션 정보 가져오기
export async function GET() {
  try {
    // 세션 정보 가져오기
    const session = await getServerSession(authOptions);

    // 세션 정보를 JSON으로 반환
    return NextResponse.json(session || {}, {
      status: 200,
    });
  } catch (error) {
    console.error("Failed to get session:", error);
    return NextResponse.json(
      { error: "Failed to get session" },
      { status: 500 }
    );
  }
}
