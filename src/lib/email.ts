import { prisma } from "@/lib/prisma";

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * SendGrid를 사용하여 이메일 전송
 * 환경변수: SENDGRID_API_KEY, SENDGRID_FROM_EMAIL
 */
export async function sendEmail(params: EmailParams): Promise<boolean> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || "noreply@vintee.kr";

  // Development mode: 이메일 전송 시뮬레이션
  if (!apiKey) {
    console.log("📧 [EMAIL SIMULATION]");
    console.log(`To: ${params.to}`);
    console.log(`Subject: ${params.subject}`);
    console.log(`Content: ${params.text || params.html.substring(0, 100)}...`);
    console.log("⚠️ SENDGRID_API_KEY not set. Email not sent.");
    return true; // Simulate success in development
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: params.to }],
          },
        ],
        from: { email: fromEmail, name: "VINTEE" },
        subject: params.subject,
        content: [
          {
            type: "text/html",
            value: params.html,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("SendGrid error:", error);
      return false;
    }

    console.log(`✅ Email sent to ${params.to}`);
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
}

// ===================================
// 예약 관련 이메일
// ===================================

export async function sendBookingConfirmationEmail(
  userEmail: string,
  bookingDetails: {
    bookingId: string;
    propertyName: string;
    checkIn: Date;
    checkOut: Date;
    guestCount: number;
    totalAmount: number;
  }
) {
  const { bookingId, propertyName, checkIn, checkOut, guestCount, totalAmount } = bookingDetails;

  const subject = `[VINTEE] 예약이 확정되었습니다 - ${propertyName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Pretendard', -apple-system, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .booking-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .cta-button { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 예약이 확정되었습니다!</h1>
        </div>
        <div class="content">
          <p>안녕하세요,</p>
          <p><strong>${propertyName}</strong>의 예약이 호스트에 의해 확정되었습니다.</p>

          <div class="booking-details">
            <h3>예약 정보</h3>
            <div class="detail-row">
              <span>예약 번호</span>
              <strong>${bookingId}</strong>
            </div>
            <div class="detail-row">
              <span>숙소</span>
              <strong>${propertyName}</strong>
            </div>
            <div class="detail-row">
              <span>체크인</span>
              <strong>${checkIn.toLocaleDateString('ko-KR')}</strong>
            </div>
            <div class="detail-row">
              <span>체크아웃</span>
              <strong>${checkOut.toLocaleDateString('ko-KR')}</strong>
            </div>
            <div class="detail-row">
              <span>인원</span>
              <strong>${guestCount}명</strong>
            </div>
            <div class="detail-row">
              <span>총 금액</span>
              <strong>₩${totalAmount.toLocaleString()}</strong>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="https://vintee.kr/bookings/${bookingId}" class="cta-button">
              예약 상세보기
            </a>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
            체크인 날짜가 가까워지면 다시 알려드리겠습니다.<br>
            궁금한 점이 있으시면 언제든 문의해주세요.
          </p>
        </div>
        <div class="footer">
          <p>© 2025 VINTEE. All rights reserved.</p>
          <p>이 이메일은 발신전용입니다.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
예약이 확정되었습니다!

숙소: ${propertyName}
체크인: ${checkIn.toLocaleDateString('ko-KR')}
체크아웃: ${checkOut.toLocaleDateString('ko-KR')}
인원: ${guestCount}명
총 금액: ₩${totalAmount.toLocaleString()}

예약 상세: https://vintee.kr/bookings/${bookingId}
  `;

  return sendEmail({ to: userEmail, subject, html, text });
}

export async function sendBookingCancellationEmail(
  userEmail: string,
  bookingDetails: {
    propertyName: string;
    checkIn: Date;
    refundAmount: number;
    refundPolicy: string;
  }
) {
  const { propertyName, checkIn, refundAmount, refundPolicy } = bookingDetails;

  const subject = `[VINTEE] 예약이 취소되었습니다 - ${propertyName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Pretendard', -apple-system, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .refund-info { background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>예약이 취소되었습니다</h1>
        </div>
        <div class="content">
          <p>안녕하세요,</p>
          <p><strong>${propertyName}</strong> (체크인: ${checkIn.toLocaleDateString('ko-KR')})의 예약이 취소되었습니다.</p>

          <div class="refund-info">
            <h3>환불 정보</h3>
            <p><strong>환불 금액:</strong> ₩${refundAmount.toLocaleString()}</p>
            <p><strong>환불 정책:</strong> ${refundPolicy}</p>
            <p style="font-size: 14px; color: #6b7280; margin-top: 10px;">
              환불은 결제하신 수단으로 3-5영업일 이내에 처리됩니다.
            </p>
          </div>

          <p>다음에 더 좋은 여행으로 뵙기를 기대합니다.</p>
        </div>
        <div class="footer">
          <p>© 2025 VINTEE. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
예약이 취소되었습니다.

숙소: ${propertyName}
체크인 예정일: ${checkIn.toLocaleDateString('ko-KR')}

환불 금액: ₩${refundAmount.toLocaleString()}
환불 정책: ${refundPolicy}
처리 기간: 3-5영업일
  `;

  return sendEmail({ to: userEmail, subject, html, text });
}

export async function sendPaymentSuccessEmail(
  userEmail: string,
  paymentDetails: {
    bookingId: string;
    propertyName: string;
    amount: number;
    paymentMethod: string;
  }
) {
  const { bookingId, propertyName, amount, paymentMethod } = paymentDetails;

  const subject = `[VINTEE] 결제가 완료되었습니다 - ${propertyName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Pretendard', -apple-system, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10b981; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .payment-info { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .cta-button { display: inline-block; background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ 결제가 완료되었습니다</h1>
        </div>
        <div class="content">
          <p>안녕하세요,</p>
          <p><strong>${propertyName}</strong> 예약 결제가 성공적으로 완료되었습니다.</p>

          <div class="payment-info">
            <h3>결제 정보</h3>
            <p><strong>결제 금액:</strong> ₩${amount.toLocaleString()}</p>
            <p><strong>결제 수단:</strong> ${paymentMethod}</p>
            <p><strong>예약 번호:</strong> ${bookingId}</p>
          </div>

          <div style="text-align: center;">
            <a href="https://vintee.kr/bookings/${bookingId}" class="cta-button">
              예약 확인하기
            </a>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
            호스트가 예약을 확인하는 대로 알려드리겠습니다.
          </p>
        </div>
        <div class="footer">
          <p>© 2025 VINTEE. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
결제가 완료되었습니다!

숙소: ${propertyName}
결제 금액: ₩${amount.toLocaleString()}
결제 수단: ${paymentMethod}
예약 번호: ${bookingId}

예약 확인: https://vintee.kr/bookings/${bookingId}
  `;

  return sendEmail({ to: userEmail, subject, html, text });
}

// ===================================
// 호스트 관련 이메일
// ===================================

export async function sendHostApprovalEmail(
  hostEmail: string,
  hostName: string
) {
  const subject = "[VINTEE] 호스트 승인이 완료되었습니다 🎉";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Pretendard', -apple-system, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .cta-button { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 호스트 승인 완료!</h1>
        </div>
        <div class="content">
          <p>안녕하세요, ${hostName}님!</p>
          <p>축하합니다! VINTEE 호스트로 승인되었습니다.</p>

          <p>이제 나만의 시골 공간을 공유하고, MZ세대 게스트들에게 특별한 촌캉스 경험을 제공할 수 있습니다.</p>

          <h3>다음 단계:</h3>
          <ol>
            <li>숙소 정보를 등록하세요</li>
            <li>매력적인 사진과 스토리를 작성하세요</li>
            <li>예약 가능한 날짜를 설정하세요</li>
            <li>관리자 승인 후 게스트를 맞이하세요</li>
          </ol>

          <div style="text-align: center;">
            <a href="https://vintee.kr/host/dashboard" class="cta-button">
              호스트 대시보드로 이동
            </a>
          </div>
        </div>
        <div class="footer">
          <p>© 2025 VINTEE. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
축하합니다!

${hostName}님이 VINTEE 호스트로 승인되었습니다.

이제 숙소를 등록하고 게스트를 맞이할 수 있습니다.

호스트 대시보드: https://vintee.kr/host/dashboard
  `;

  return sendEmail({ to: hostEmail, subject, html, text });
}

export async function sendPropertyApprovalEmail(
  hostEmail: string,
  propertyDetails: {
    propertyId: string;
    propertyName: string;
  }
) {
  const { propertyId, propertyName } = propertyDetails;

  const subject = `[VINTEE] 숙소가 승인되었습니다 - ${propertyName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Pretendard', -apple-system, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10b981; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .cta-button { display: inline-block; background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 숙소 승인 완료!</h1>
        </div>
        <div class="content">
          <p>안녕하세요,</p>
          <p><strong>${propertyName}</strong>이(가) 관리자에 의해 승인되었습니다.</p>

          <p>이제 게스트들이 검색 결과에서 숙소를 확인하고 예약할 수 있습니다!</p>

          <div style="text-align: center;">
            <a href="https://vintee.kr/property/${propertyId}" class="cta-button">
              숙소 페이지 보기
            </a>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
            예약이 들어오면 즉시 알려드리겠습니다.<br>
            게스트들에게 특별한 경험을 선사해주세요!
          </p>
        </div>
        <div class="footer">
          <p>© 2025 VINTEE. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
숙소가 승인되었습니다!

${propertyName}이(가) 관리자에 의해 승인되었습니다.
이제 게스트들이 예약할 수 있습니다!

숙소 페이지: https://vintee.kr/property/${propertyId}
  `;

  return sendEmail({ to: hostEmail, subject, html, text });
}

// ===================================
// 유틸리티 함수
// ===================================

/**
 * 사용자 ID로 이메일 주소 조회
 */
export async function getUserEmail(userId: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    return user?.email || null;
  } catch (error) {
    console.error("Error fetching user email:", error);
    return null;
  }
}
