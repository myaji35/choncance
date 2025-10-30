import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/wishlist/property/[id] - Check if property is in wishlist
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await auth();
    const { id: propertyId } = await params;

    if (!userId) {
      return NextResponse.json(
        { isWishlisted: false, wishlistId: null },
        { status: 200 }
      );
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });

    return NextResponse.json({
      isWishlisted: !!wishlist,
      wishlistId: wishlist?.id || null,
    });
  } catch (error: any) {
    console.error("Error checking wishlist:", error);
    return NextResponse.json(
      { error: "Failed to check wishlist" },
      { status: 500 }
    );
  }
}

// DELETE /api/wishlist/property/[id] - Remove from wishlist
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await auth();
    const { id: propertyId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if in wishlist
    const wishlist = await prisma.wishlist.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });

    if (!wishlist) {
      return NextResponse.json(
        { error: "Property not in wishlist" },
        { status: 404 }
      );
    }

    // Remove from wishlist
    await prisma.wishlist.delete({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}
