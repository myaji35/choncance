import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/admin/hosts/:id/approve
 * Approve a pending host application
 * - Updates HostProfile.status to APPROVED
 * - Updates User.role to HOST
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await getUser();

    if (!authUser || !authUser.profile) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    const userId = authUser.profile.id;

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (dbUser?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다" },
        { status: 403 }
      );
    }

    // Find the host profile
    const hostProfile = await prisma.hostProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!hostProfile) {
      return NextResponse.json(
        { error: "호스트 프로필을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    if (hostProfile.status === "APPROVED") {
      return NextResponse.json(
        { error: "이미 승인된 호스트입니다" },
        { status: 400 }
      );
    }

    // Update host profile status and user role in a transaction
    await prisma.$transaction([
      prisma.hostProfile.update({
        where: { id },
        data: { status: "APPROVED" },
      }),
      prisma.user.update({
        where: { id: hostProfile.userId },
        data: { role: "HOST" },
      }),
    ]);

    // Create notification for the host
    try {
      await prisma.notification.create({
        data: {
          userId: hostProfile.userId,
          type: "PROPERTY_APPROVED",
          title: "호스트 신청이 승인되었습니다",
          message:
            "축하합니다! 호스트 신청이 승인되었습니다. 이제 숙소를 등록할 수 있습니다.",
          link: "/host/dashboard",
        },
      });
    } catch (notificationError) {
      console.error("Failed to send notification:", notificationError);
    }

    return NextResponse.json({
      message: "호스트가 승인되었습니다",
      hostProfile: {
        id: hostProfile.id,
        userId: hostProfile.userId,
        status: "APPROVED",
      },
    });
  } catch (error) {
    console.error("Host approval error:", error);
    return NextResponse.json(
      { error: "호스트 승인에 실패했습니다" },
      { status: 500 }
    );
  }
}
