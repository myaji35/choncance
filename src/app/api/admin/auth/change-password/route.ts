import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "인증되지 않았습니다" },
        { status: 401 }
      );
    }

    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: "유효하지 않은 토큰입니다" },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "현재 패스워드와 새 패스워드를 입력해주세요" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "새 패스워드는 최소 6자 이상이어야 합니다" },
        { status: 400 }
      );
    }

    // For now, use a hardcoded admin password hash
    // In production, this should be stored in a secure configuration
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH ||
      await bcrypt.hash("admin123", 10);

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, adminPasswordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "현재 패스워드가 올바르지 않습니다" },
        { status: 401 }
      );
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // In production, update password in a secure configuration store
    // For now, just return success
    console.log("New password hash (store this securely):", newPasswordHash);

    return NextResponse.json({
      success: true,
      message: "패스워드가 변경되었습니다",
    });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json(
      { error: "패스워드 변경 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
