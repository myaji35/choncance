import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface BookingConfirmationData {
  customerName: string;
  propertyName: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalAmount: number;
  bookingId: string;
}

export function getBookingConfirmationEmail(data: BookingConfirmationData): {
  subject: string;
  html: string;
} {
  const subject = `[VINTEE] 예약이 확정되었습니다 - ${data.propertyName}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #16a34a; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px 20px; }
          .booking-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: 600; color: #6b7280; }
          .detail-value { color: #111827; }
          .total-row { background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 15px; }
          .button { display: inline-block; background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 예약이 확정되었습니다!</h1>
            <p>VINTEE를 이용해 주셔서 감사합니다</p>
          </div>

          <div class="content">
            <p>안녕하세요 ${data.customerName}님,</p>
            <p><strong>${data.propertyName}</strong> 예약이 성공적으로 완료되었습니다.</p>

            <div class="booking-details">
              <h2 style="color: #16a34a; margin-top: 0;">예약 정보</h2>

              <div class="detail-row">
                <span class="detail-label">예약 번호</span>
                <span class="detail-value">${data.bookingId.slice(0, 8).toUpperCase()}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">숙소</span>
                <span class="detail-value">${data.propertyName}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">체크인</span>
                <span class="detail-value">${format(data.checkIn, "yyyy년 M월 d일", { locale: ko })}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">체크아웃</span>
                <span class="detail-value">${format(data.checkOut, "yyyy년 M월 d일", { locale: ko })}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">게스트 수</span>
                <span class="detail-value">${data.guests}명</span>
              </div>

              <div class="total-row">
                <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 600;">
                  <span>총 금액</span>
                  <span style="color: #16a34a;">${data.totalAmount.toLocaleString()}원</span>
                </div>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="https://vintee.com/bookings/${data.bookingId}" class="button">
                예약 상세보기
              </a>
            </div>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;"><strong>안내사항</strong></p>
              <ul style="margin: 10px 0; padding-left: 20px; color: #92400e;">
                <li>체크인 1일 전에 호스트로부터 연락을 받게 됩니다</li>
                <li>취소 정책을 확인해주세요 (체크인 7일 전까지 전액 환불)</li>
                <li>특별 요청사항이 있으시면 미리 호스트에게 알려주세요</li>
              </ul>
            </div>
          </div>

          <div class="footer">
            <p>VINTEE 고객센터: support@vintee.com</p>
            <p>© 2026 VINTEE. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return { subject, html };
}

interface RefundConfirmationData {
  customerName: string;
  propertyName: string;
  refundAmount: number;
  reason: string;
  bookingId: string;
}

export function getRefundConfirmationEmail(data: RefundConfirmationData): {
  subject: string;
  html: string;
} {
  const subject = `[VINTEE] 환불이 완료되었습니다 - ${data.propertyName}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #6b7280; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px 20px; }
          .refund-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>환불이 처리되었습니다</h1>
          </div>

          <div class="content">
            <p>안녕하세요 ${data.customerName}님,</p>
            <p>요청하신 환불이 완료되었습니다.</p>

            <div class="refund-details">
              <h2 style="color: #6b7280; margin-top: 0;">환불 정보</h2>

              <div class="detail-row">
                <strong>예약 번호:</strong> ${data.bookingId.slice(0, 8).toUpperCase()}
              </div>

              <div class="detail-row">
                <strong>숙소:</strong> ${data.propertyName}
              </div>

              <div class="detail-row">
                <strong>환불 금액:</strong> <span style="color: #dc2626; font-size: 18px; font-weight: 600;">${data.refundAmount.toLocaleString()}원</span>
              </div>

              <div class="detail-row">
                <strong>환불 사유:</strong> ${data.reason}
              </div>
            </div>

            <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; color: #1e40af;"><strong>환불 안내</strong></p>
              <p style="margin: 10px 0 0; color: #1e40af;">
                환불 금액은 영업일 기준 3-5일 이내에 원 결제 수단으로 입금됩니다.
                카드 결제의 경우 카드사에 따라 영업일 기준 1-7일이 추가로 소요될 수 있습니다.
              </p>
            </div>
          </div>

          <div class="footer">
            <p>더 나은 서비스를 제공하기 위해 노력하겠습니다.</p>
            <p>VINTEE 고객센터: support@vintee.com</p>
            <p>© 2026 VINTEE. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return { subject, html };
}

interface PaymentFailedData {
  customerName: string;
  propertyName: string;
  errorMessage: string;
  bookingId: string;
}

export function getPaymentFailedEmail(data: PaymentFailedData): {
  subject: string;
  html: string;
} {
  const subject = `[VINTEE] 결제 실패 안내 - ${data.propertyName}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc2626; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px 20px; }
          .button { display: inline-block; background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ 결제가 실패했습니다</h1>
          </div>

          <div class="content">
            <p>안녕하세요 ${data.customerName}님,</p>
            <p><strong>${data.propertyName}</strong> 예약 결제가 실패했습니다.</p>

            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>실패 사유:</strong></p>
              <p style="color: #dc2626;">${data.errorMessage}</p>
            </div>

            <p>다시 시도하시거나, 다른 결제 수단을 사용해 주세요.</p>

            <div style="text-align: center;">
              <a href="https://vintee.com/booking/checkout?bookingId=${data.bookingId}" class="button">
                다시 결제하기
              </a>
            </div>
          </div>

          <div class="footer">
            <p>문의사항이 있으시면 언제든 연락주세요.</p>
            <p>VINTEE 고객센터: support@vintee.com</p>
            <p>© 2026 VINTEE. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return { subject, html };
}
