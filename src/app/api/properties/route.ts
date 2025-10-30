import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// GET /api/properties - 숙소 목록 조회 (다양한 필터링 지원)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 필터 파라미터
    const tagsParam = searchParams.get("tags"); // 쉼표로 구분된 태그명
    const search = searchParams.get("search");
    const status = searchParams.get("status") || "APPROVED";
    const minPrice = searchParams.get("min_price");
    const maxPrice = searchParams.get("max_price");
    const province = searchParams.get("province");
    const city = searchParams.get("city");
    const checkIn = searchParams.get("check_in");
    const checkOut = searchParams.get("check_out");
    const guests = searchParams.get("guests");
    const pets = searchParams.get("pets");

    // 기본 필터링 조건
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {
      status,
    };

    // 검색 필터링 (name, description, address 등에서 검색)
    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          address: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          province: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          city: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // 태그 필터링
    if (tagsParam) {
      const tagNames = tagsParam.split(",").map((tag) => tag.trim());
      whereClause.tags = {
        some: {
          name: {
            in: tagNames,
          },
        },
      };
    }

    // 가격 필터링
    if (minPrice || maxPrice) {
      whereClause.pricePerNight = {};
      if (minPrice) {
        whereClause.pricePerNight.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        whereClause.pricePerNight.lte = parseFloat(maxPrice);
      }
    }

    // 지역 필터링
    if (province) {
      whereClause.province = province;
    }
    if (city) {
      whereClause.city = city;
    }

    // 인원 필터링
    if (guests) {
      whereClause.maxGuests = {
        gte: parseInt(guests),
      };
    }

    // 반려동물 필터링
    if (pets === "true") {
      whereClause.allowsPets = true;
    }

    // 날짜 필터링 - 예약 불가능한 숙소 제외
    let unavailablePropertyIds: string[] = [];
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      // 해당 기간에 이미 예약된 숙소 찾기
      const overlappingBookings = await prisma.booking.findMany({
        where: {
          status: {
            in: ["CONFIRMED", "PENDING"],
          },
          OR: [
            {
              checkIn: {
                lt: checkOutDate,
              },
              checkOut: {
                gt: checkInDate,
              },
            },
          ],
        },
        select: {
          propertyId: true,
        },
      });

      unavailablePropertyIds = overlappingBookings.map((b) => b.propertyId);

      if (unavailablePropertyIds.length > 0) {
        whereClause.id = {
          notIn: unavailablePropertyIds,
        };
      }
    }

    const properties = await prisma.property.findMany({
      where: whereClause,
      include: {
        tags: {
          orderBy: {
            category: "asc",
          },
        },
        host: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            tags: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ properties });
  } catch (error) {
    console.error("숙소 조회 오류:", error);
    return NextResponse.json(
      { error: "숙소 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}
