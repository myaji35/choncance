import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a host
    const hostProfile = await prisma.hostProfile.findUnique({
      where: { userId },
    });

    if (!hostProfile) {
      return NextResponse.json(
        { error: "Host profile not found" },
        { status: 404 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build date filter
    const dateFilter = {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate) }),
    };

    // Get all host properties
    const properties = await prisma.property.findMany({
      where: { hostId: hostProfile.id },
      select: { id: true },
    });

    const propertyIds = properties.map((p) => p.id);

    // Get all bookings for host properties
    const bookings = await prisma.booking.findMany({
      where: {
        propertyId: { in: propertyIds },
        ...(Object.keys(dateFilter).length > 0 && {
          createdAt: dateFilter,
        }),
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
          },
        },
        payment: {
          select: {
            status: true,
            amount: true,
          },
        },
        review: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate statistics

    // 1. Total revenue (only from CONFIRMED and COMPLETED bookings with successful payments)
    const totalRevenue = bookings
      .filter(
        (b) =>
          (b.status === BookingStatus.CONFIRMED ||
            b.status === BookingStatus.COMPLETED) &&
          b.payment?.status === "SUCCESS"
      )
      .reduce((sum, b) => {
        const amount =
          typeof b.totalAmount === "number"
            ? b.totalAmount
            : b.totalAmount.toNumber();
        return sum + amount;
      }, 0);

    // 2. Booking counts by status
    const bookingsByStatus = {
      PENDING: bookings.filter((b) => b.status === BookingStatus.PENDING)
        .length,
      CONFIRMED: bookings.filter((b) => b.status === BookingStatus.CONFIRMED)
        .length,
      CANCELLED: bookings.filter((b) => b.status === BookingStatus.CANCELLED)
        .length,
      COMPLETED: bookings.filter((b) => b.status === BookingStatus.COMPLETED)
        .length,
      REJECTED: bookings.filter((b) => b.status === BookingStatus.REJECTED)
        .length,
      NO_SHOW: bookings.filter((b) => b.status === BookingStatus.NO_SHOW)
        .length,
    };

    // 3. Revenue by date (for chart)
    const revenueByDate = bookings
      .filter(
        (b) =>
          (b.status === BookingStatus.CONFIRMED ||
            b.status === BookingStatus.COMPLETED) &&
          b.payment?.status === "SUCCESS"
      )
      .reduce((acc, b) => {
        const date = b.createdAt.toISOString().split("T")[0];
        const amount =
          typeof b.totalAmount === "number"
            ? b.totalAmount
            : b.totalAmount.toNumber();

        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += amount;

        return acc;
      }, {} as Record<string, number>);

    // Convert to array and sort by date
    const revenueByDateArray = Object.entries(revenueByDate)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 4. Property performance (bookings and revenue by property)
    const propertyPerformance = bookings.reduce((acc, b) => {
      const propertyId = b.property.id;
      const propertyName = b.property.name;

      if (!acc[propertyId]) {
        acc[propertyId] = {
          propertyId,
          propertyName,
          totalBookings: 0,
          confirmedBookings: 0,
          totalRevenue: 0,
          averageRating: 0,
          reviewCount: 0,
        };
      }

      acc[propertyId].totalBookings += 1;

      if (
        b.status === BookingStatus.CONFIRMED ||
        b.status === BookingStatus.COMPLETED
      ) {
        acc[propertyId].confirmedBookings += 1;

        if (b.payment?.status === "SUCCESS") {
          const amount =
            typeof b.totalAmount === "number"
              ? b.totalAmount
              : b.totalAmount.toNumber();
          acc[propertyId].totalRevenue += amount;
        }
      }

      if (b.review?.rating) {
        acc[propertyId].reviewCount += 1;
        acc[propertyId].averageRating += b.review.rating;
      }

      return acc;
    }, {} as Record<string, any>);

    // Calculate average ratings
    const propertyPerformanceArray = Object.values(propertyPerformance).map(
      (p: any) => ({
        ...p,
        averageRating:
          p.reviewCount > 0 ? p.averageRating / p.reviewCount : 0,
      })
    );

    // Sort by revenue descending
    propertyPerformanceArray.sort((a, b) => b.totalRevenue - a.totalRevenue);

    // 5. Review statistics
    const totalReviews = bookings.filter((b) => b.review).length;
    const averageRating =
      totalReviews > 0
        ? bookings
            .filter((b) => b.review)
            .reduce((sum, b) => sum + (b.review?.rating || 0), 0) /
          totalReviews
        : 0;

    // 6. Recent bookings (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentBookingsCount = bookings.filter(
      (b) => b.createdAt >= sevenDaysAgo
    ).length;

    // 7. Monthly statistics (current month)
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyBookings = bookings.filter(
      (b) => b.createdAt >= firstDayOfMonth && b.createdAt <= lastDayOfMonth
    );

    const monthlyRevenue = monthlyBookings
      .filter(
        (b) =>
          (b.status === BookingStatus.CONFIRMED ||
            b.status === BookingStatus.COMPLETED) &&
          b.payment?.status === "SUCCESS"
      )
      .reduce((sum, b) => {
        const amount =
          typeof b.totalAmount === "number"
            ? b.totalAmount
            : b.totalAmount.toNumber();
        return sum + amount;
      }, 0);

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalBookings: bookings.length,
        confirmedBookings:
          bookingsByStatus.CONFIRMED + bookingsByStatus.COMPLETED,
        pendingBookings: bookingsByStatus.PENDING,
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        recentBookingsCount,
        monthlyRevenue,
        monthlyBookingsCount: monthlyBookings.length,
      },
      bookingsByStatus,
      revenueByDate: revenueByDateArray,
      propertyPerformance: propertyPerformanceArray,
    });
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
