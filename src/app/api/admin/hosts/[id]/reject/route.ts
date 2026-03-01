import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/admin/hosts/:id/reject
 * Reject a pending host application
 * - Updates HostProfile.status to REJECTED
 * - Keeps User.role as HOST_PENDING (or reverts to USER)
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

    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim().length < 20) {
      return NextResponse.json(
        { error: "거부 사유를 20자 이상 입력해주세요" },
        { status: 400 }
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

    if (hostProfile.status === "REJECTED") {
      return NextResponse.json(
        { error: "이미 거부된 호스트입니다" },
        { status: 400 }
      );
    }

    // Update host profile status and revert user role
    await prisma.$transaction([
      prisma.hostProfile.update({
        where: { id },
        data: { status: "REJECTED" },
      }),
      prisma.user.update({
        where: { id: hostProfile.userId },
        data: { role: "USER" },
      }),
    ]);

    // Create notification for the host
    try {
      await prisma.notification.create({
        data: {
          userId: hostProfile.userId,
          type: "PROPERTY_REJECTED",
          title: "호스트 신청이 거부되었습니다",
          message: `호스트 신청이 거부되었습니다. 사유: ${reason}`,
          link: "/become-a-host",
        },
      });
    } catch (notificationError) {
      console.error("Failed to send notification:", notificationError);
    }

    return NextResponse.json({
      message: "호스트 신청이 거부되었습니다",
      hostProfile: {
        id: hostProfile.id,
        userId: hostProfile.userId,
        status: "REJECTED",
      },
    });
  } catch (error) {
    console.error("Host rejection error:", error);
    return NextResponse.json(
      { error: "호스트 거부에 실패했습니다" },
      { status: 500 }
    );
  }
}
