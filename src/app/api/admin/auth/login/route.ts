import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const DEFAULT_PASSWORD = "admin123";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "패스워드를 입력해주세요" },
        { status: 400 }
      );
    }

    // Get admin password from environment or use default
    // In production, this should be stored securely
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH ||
      await bcrypt.hash(DEFAULT_PASSWORD, 10);

    // Verify password
    const isValid = await bcrypt.compare(password, adminPasswordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "패스워드가 올바르지 않습니다" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { role: "admin", username: "admin" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      message: "로그인 성공",
    });

    // Set HTTP-only cookie
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "로그인 처리 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
