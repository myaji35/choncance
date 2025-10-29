import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/wishlist/property/:propertyId
 * Check if property is in user's wishlist
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ isWishlisted: false });
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId: params.propertyId,
        },
      },
    });

    return NextResponse.json({
      isWishlisted: !!wishlist,
      wishlistId: wishlist?.id || null,
    });
  } catch (error) {
    console.error("Check wishlist error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/wishlist/property/:propertyId
 * Remove property from wishlist by propertyId
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find and delete wishlist item
    const wishlist = await prisma.wishlist.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId: params.propertyId,
        },
      },
    });

    if (!wishlist) {
      return NextResponse.json(
        { error: "Not in wishlist" },
        { status: 404 }
      );
    }

    await prisma.wishlist.delete({
      where: { id: wishlist.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
