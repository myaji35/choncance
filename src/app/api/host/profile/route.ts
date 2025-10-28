import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/host/profile - 호스트 프로필 생성 (호스트 신청)
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { businessNumber, contact } = body;

    // Validation
    if (!businessNumber || !contact) {
      return NextResponse.json(
        { error: "사업자 등록번호와 연락처는 필수입니다" },
        { status: 400 }
      );
    }

    // Check if user exists, if not create from Clerk data
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: { hostProfile: true },
    });

    if (!user) {
      // Fetch user data from Clerk
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);

      // Create user in database
      user = await prisma.user.create({
        data: {
          id: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null,
        },
        include: { hostProfile: true },
      });
    }

    // Check if host profile already exists
    if (user.hostProfile) {
      return NextResponse.json(
        {
          error: "이미 호스트 프로필이 존재합니다",
          code: "HOST_PROFILE_EXISTS",
          status: user.hostProfile.status,
        },
        { status: 400 }
      );
    }

    // Create host profile
    const hostProfile = await prisma.hostProfile.create({
      data: {
        userId,
        businessNumber,
        contact,
        status: "PENDING", // 관리자 승인 대기
      },
    });

    // TODO: Send notification to admin for approval
    // TODO: Send confirmation email to user

    return NextResponse.json({
      hostProfile,
      message: "호스트 신청이 완료되었습니다. 관리자 승인 후 호스트 활동을 시작할 수 있습니다.",
    });
  } catch (error) {
    console.error("Failed to create host profile:", error);
    return NextResponse.json(
      { error: "호스트 프로필 생성에 실패했습니다" },
      { status: 500 }
    );
  }
}

// GET /api/host/profile - 현재 사용자의 호스트 프로필 조회
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    // Check if user exists, if not create from Clerk data
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        hostProfile: true,
      },
    });

    if (!user) {
      // Fetch user data from Clerk and create in database
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);

      user = await prisma.user.create({
        data: {
          id: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null,
        },
        include: { hostProfile: true },
      });
    }

    return NextResponse.json({
      hostProfile: user.hostProfile,
    });
  } catch (error) {
    console.error("Failed to fetch host profile:", error);
    return NextResponse.json(
      { error: "호스트 프로필 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}
