import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/sns
 * Get all SNS accounts
 */
export async function GET() {
  try {
    // TODO: Add admin authentication check

    const accounts = await prisma.sNSAccount.findMany({
      orderBy: [
        { platform: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error("Get SNS accounts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/sns
 * Create a new SNS account
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check

    const body = await request.json();
    const {
      platform,
      accountName,
      accountUrl,
      accessToken,
      refreshToken,
      followerCount,
    } = body;

    // Validation
    if (!platform || !accountName || !accountUrl) {
      return NextResponse.json(
        { error: "platform, accountName, and accountUrl are required" },
        { status: 400 }
      );
    }

    // Check if account already exists
    const existing = await prisma.sNSAccount.findFirst({
      where: {
        platform,
        accountName,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "SNS account already exists" },
        { status: 400 }
      );
    }

    // Create account
    const account = await prisma.sNSAccount.create({
      data: {
        platform,
        accountName,
        accountUrl,
        accessToken: accessToken || null,
        refreshToken: refreshToken || null,
        followerCount: followerCount || null,
      },
    });

    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    console.error("Create SNS account error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/sns
 * Update an SNS account
 */
export async function PATCH(request: NextRequest) {
  try {
    // TODO: Add admin authentication check

    const body = await request.json();
    const {
      id,
      accountName,
      accountUrl,
      accessToken,
      refreshToken,
      followerCount,
      isActive,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    // Update account
    const account = await prisma.sNSAccount.update({
      where: { id },
      data: {
        ...(accountName && { accountName }),
        ...(accountUrl && { accountUrl }),
        ...(accessToken !== undefined && { accessToken }),
        ...(refreshToken !== undefined && { refreshToken }),
        ...(followerCount !== undefined && { followerCount }),
        ...(isActive !== undefined && { isActive }),
        lastPostAt: new Date(), // Update last activity
      },
    });

    return NextResponse.json({ account });
  } catch (error) {
    console.error("Update SNS account error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/sns?id=xxx
 * Delete an SNS account
 */
export async function DELETE(request: NextRequest) {
  try {
    // TODO: Add admin authentication check

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    await prisma.sNSAccount.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete SNS account error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
