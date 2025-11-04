import { NextRequest, NextResponse } from "next/server";
import { qrLoginStore } from "@/lib/qr-login-store";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Allowed admin phone numbers (in addition to DB ADMIN users)
const ALLOWED_ADMIN_PHONES = [
  "1054708008",      // 010-5470-8008
  "01054708008",     // 010-5470-8008
  "01089941584",     // 010-899-41584 (수정: 0 하나 제거)
  "1089941584",      // 010-899-41584 (수정: 0 하나 제거)
];

// POST /api/admin/qr-login/verify - Verify phone number for admin login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, phone } = body;

    if (!sessionId || !phone) {
      return NextResponse.json(
        { error: "세션 ID와 핸드폰 번호가 필요합니다" },
        { status: 400 }
      );
    }

    // Check if session exists
    const session = qrLoginStore.getSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: "세션이 만료되었거나 존재하지 않습니다" },
        { status: 404 }
      );
    }

    // Normalize phone number (remove hyphens, spaces, plus signs)
    const normalizedPhone = phone.replace(/[-\s+]/g, "");

    // Generate phone number patterns for matching
    // Supports Korea (+82), Japan (+81), Vietnam (+84) formats
    const phonePatterns: string[] = [normalizedPhone];

    // Remove country codes and generate variations
    const countryCodeMap: { [key: string]: string } = {
      '82': '0',   // Korea: +82 10 → 010
      '81': '0',   // Japan: +81 90 → 090
      '84': '0',   // Vietnam: +84 90 → 090
    };

    for (const [code, prefix] of Object.entries(countryCodeMap)) {
      if (normalizedPhone.startsWith(code)) {
        // +82 10-5470-8008 → 821054708008 → 01054708008
        phonePatterns.push(prefix + normalizedPhone.substring(code.length));
        // Also add without leading 0: 1054708008
        phonePatterns.push(normalizedPhone.substring(code.length));
        break;
      }
    }

    // If starts with 0, also add version without 0
    if (normalizedPhone.startsWith('0')) {
      // 01054708008 → 1054708008
      phonePatterns.push(normalizedPhone.substring(1));
    }

    console.log('[QR Verify] Phone patterns:', phonePatterns);

    // Check if phone matches allowed admin phones
    const isAllowedAdmin = phonePatterns.some(pattern =>
      ALLOWED_ADMIN_PHONES.some(allowed =>
        pattern.includes(allowed) || allowed.includes(pattern)
      )
    );

    if (isAllowedAdmin) {
      console.log('[QR Verify] Phone matched allowed admin list');

      // Get first admin user from DB
      const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
      });

      if (!adminUser) {
        return NextResponse.json(
          { error: "관리자 계정을 찾을 수 없습니다" },
          { status: 404 }
        );
      }

      // Authenticate session
      const success = qrLoginStore.authenticateSession(
        sessionId,
        adminUser.id,
        phone
      );

      if (!success) {
        return NextResponse.json(
          { error: "세션 인증에 실패했습니다" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "인증되었습니다. PC에서 자동으로 로그인됩니다.",
        user: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
        },
      });
    }

    // Find user by phone number (match any pattern)
    const user = await prisma.user.findFirst({
      where: {
        OR: phonePatterns.map(pattern => ({
          phone: { contains: pattern }
        })).concat(
          // Also check if DB phone is contained in any pattern
          phonePatterns.map(pattern => ({
            phone: { not: null },
            AND: {
              phone: { not: '' },
            }
          }))
        ),
      },
    });

    // Additional check: normalize DB phone and compare
    if (!user) {
      const allUsers = await prisma.user.findMany({
        where: { role: 'ADMIN' },
      });

      for (const adminUser of allUsers) {
        if (!adminUser.phone) continue;

        const dbPhoneNormalized = adminUser.phone.replace(/[-\s+]/g, '');

        // Check if any pattern matches
        for (const pattern of phonePatterns) {
          if (pattern.includes(dbPhoneNormalized) || dbPhoneNormalized.includes(pattern)) {
            console.log(`[QR Verify] Matched admin: ${adminUser.email} (phone: ${adminUser.phone})`);

            if (adminUser.role !== "ADMIN") {
              return NextResponse.json(
                { error: "관리자 권한이 없습니다" },
                { status: 403 }
              );
            }

            // Authenticate session
            const success = qrLoginStore.authenticateSession(
              sessionId,
              adminUser.id,
              adminUser.phone || phone
            );

            if (!success) {
              return NextResponse.json(
                { error: "세션 인증에 실패했습니다" },
                { status: 500 }
              );
            }

            return NextResponse.json({
              success: true,
              message: "인증되었습니다. PC에서 자동으로 로그인됩니다.",
              user: {
                id: adminUser.id,
                name: adminUser.name,
                email: adminUser.email,
              },
            });
          }
        }
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "등록되지 않은 핸드폰 번호입니다" },
        { status: 404 }
      );
    }

    // Check if user is admin
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 없습니다" },
        { status: 403 }
      );
    }

    // Authenticate session
    const success = qrLoginStore.authenticateSession(
      sessionId,
      user.id,
      user.phone || phone
    );

    if (!success) {
      return NextResponse.json(
        { error: "세션 인증에 실패했습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "인증되었습니다. PC에서 자동으로 로그인됩니다.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Failed to verify phone number:", error);
    return NextResponse.json(
      { error: "핸드폰 번호 확인에 실패했습니다" },
      { status: 500 }
    );
  }
}
