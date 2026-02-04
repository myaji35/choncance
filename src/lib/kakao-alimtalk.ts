/**
 * 카카오 알림톡 전송 라이브러리
 *
 * 카카오 비즈니스 메시지 API를 사용하여 알림톡을 전송합니다.
 *
 * 설정 방법:
 * 1. 카카오톡 채널 생성 (https://center-pf.kakao.com/)
 * 2. 카카오 비즈니스 계정 생성 및 연동
 * 3. 알림톡 템플릿 등록 및 승인
 * 4. REST API 키 발급
 *
 * 환경 변수:
 * - KAKAO_ALIMTALK_API_KEY: REST API 키
 * - KAKAO_ALIMTALK_SENDER_KEY: 발신 프로필 키
 * - KAKAO_ALIMTALK_ENABLED: 알림톡 활성화 여부 (true/false)
 */

interface AlimtalkButton {
  name: string;
  type: "WL" | "AL" | "DS" | "BK" | "MD" | "BC" | "BT" | "AC";
  url_mobile?: string;
  url_pc?: string;
  scheme_ios?: string;
  scheme_android?: string;
}

interface AlimtalkTemplate {
  templateCode: string;
  templateParameter: Record<string, string>;
  buttons?: AlimtalkButton[];
}

interface SendAlimtalkParams {
  phoneNumber: string;
  templateCode: string;
  templateParameter: Record<string, string>;
  buttons?: AlimtalkButton[];
}

/**
 * 카카오 알림톡 전송
 */
export async function sendAlimtalk(params: SendAlimtalkParams): Promise<boolean> {
  const { phoneNumber, templateCode, templateParameter, buttons } = params;

  // 환경 변수 확인
  const apiKey = process.env.KAKAO_ALIMTALK_API_KEY;
  const senderKey = process.env.KAKAO_ALIMTALK_SENDER_KEY;
  const enabled = process.env.KAKAO_ALIMTALK_ENABLED === "true";

  if (!enabled) {
    console.log("[AlimTalk] Disabled - skipping message send");
    return false;
  }

  if (!apiKey || !senderKey) {
    console.error("[AlimTalk] Missing configuration");
    return false;
  }

  // 전화번호 포맷팅 (010-1234-5678 -> 01012345678)
  const formattedPhone = phoneNumber.replace(/[^0-9]/g, "");

  try {
    // 카카오 비즈니스 메시지 API 호출
    // API 문서: https://developers.kakao.com/docs/latest/ko/message/rest-api
    const response = await fetch("https://kapi.kakao.com/v2/api/talk/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `KakaoAK ${apiKey}`,
      },
      body: JSON.stringify({
        receiver: formattedPhone,
        sender_key: senderKey,
        template_code: templateCode,
        template_parameter: templateParameter,
        buttons: buttons || [],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[AlimTalk] Send failed:", error);
      return false;
    }

    const result = await response.json();
    console.log("[AlimTalk] Message sent successfully:", result);
    return true;
  } catch (error) {
    console.error("[AlimTalk] Error:", error);
    return false;
  }
}

/**
 * 예약 확정 알림톡 전송
 * 템플릿 코드: BOOKING_CONFIRMED (등록 필요)
 */
export async function sendBookingConfirmedAlimtalk(
  phoneNumber: string,
  params: {
    guestName: string;
    propertyName: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    totalAmount: number;
    bookingId: string;
  }
) {
  return sendAlimtalk({
    phoneNumber,
    templateCode: "BOOKING_CONFIRMED",
    templateParameter: {
      guest_name: params.guestName,
      property_name: params.propertyName,
      check_in: params.checkIn,
      check_out: params.checkOut,
      guests: params.guests.toString(),
      total_amount: params.totalAmount.toLocaleString(),
    },
    buttons: [
      {
        name: "예약 확인하기",
        type: "WL",
        url_mobile: `${process.env.NEXT_PUBLIC_API_URL}/bookings/${params.bookingId}`,
        url_pc: `${process.env.NEXT_PUBLIC_API_URL}/bookings/${params.bookingId}`,
      },
    ],
  });
}

/**
 * 예약 거절 알림톡 전송
 * 템플릿 코드: BOOKING_REJECTED (등록 필요)
 */
export async function sendBookingRejectedAlimtalk(
  phoneNumber: string,
  params: {
    guestName: string;
    propertyName: string;
    checkIn: string;
    checkOut: string;
  }
) {
  return sendAlimtalk({
    phoneNumber,
    templateCode: "BOOKING_REJECTED",
    templateParameter: {
      guest_name: params.guestName,
      property_name: params.propertyName,
      check_in: params.checkIn,
      check_out: params.checkOut,
    },
    buttons: [
      {
        name: "다른 숙소 찾기",
        type: "WL",
        url_mobile: `${process.env.NEXT_PUBLIC_API_URL}/explore`,
        url_pc: `${process.env.NEXT_PUBLIC_API_URL}/explore`,
      },
    ],
  });
}

/**
 * 예약 취소 알림톡 전송
 * 템플릿 코드: BOOKING_CANCELLED (등록 필요)
 */
export async function sendBookingCancelledAlimtalk(
  phoneNumber: string,
  params: {
    guestName: string;
    propertyName: string;
    checkIn: string;
    checkOut: string;
    refundAmount: number;
  }
) {
  return sendAlimtalk({
    phoneNumber,
    templateCode: "BOOKING_CANCELLED",
    templateParameter: {
      guest_name: params.guestName,
      property_name: params.propertyName,
      check_in: params.checkIn,
      check_out: params.checkOut,
      refund_amount: params.refundAmount.toLocaleString(),
    },
  });
}

/**
 * 결제 완료 알림톡 전송
 * 템플릿 코드: PAYMENT_SUCCESS (등록 필요)
 */
export async function sendPaymentSuccessAlimtalk(
  phoneNumber: string,
  params: {
    guestName: string;
    propertyName: string;
    amount: number;
    paymentMethod: string;
    bookingId: string;
  }
) {
  return sendAlimtalk({
    phoneNumber,
    templateCode: "PAYMENT_SUCCESS",
    templateParameter: {
      guest_name: params.guestName,
      property_name: params.propertyName,
      amount: params.amount.toLocaleString(),
      payment_method: params.paymentMethod,
    },
    buttons: [
      {
        name: "예약 확인하기",
        type: "WL",
        url_mobile: `${process.env.NEXT_PUBLIC_API_URL}/bookings/${params.bookingId}`,
        url_pc: `${process.env.NEXT_PUBLIC_API_URL}/bookings/${params.bookingId}`,
      },
    ],
  });
}

/**
 * 체크인 리마인더 알림톡 전송
 * 템플릿 코드: CHECKIN_REMINDER (등록 필요)
 */
export async function sendCheckinReminderAlimtalk(
  phoneNumber: string,
  params: {
    guestName: string;
    propertyName: string;
    checkIn: string;
    checkInTime: string;
    propertyAddress: string;
    hostPhone: string;
    bookingId: string;
  }
) {
  return sendAlimtalk({
    phoneNumber,
    templateCode: "CHECKIN_REMINDER",
    templateParameter: {
      guest_name: params.guestName,
      property_name: params.propertyName,
      check_in: params.checkIn,
      check_in_time: params.checkInTime,
      property_address: params.propertyAddress,
      host_phone: params.hostPhone,
    },
    buttons: [
      {
        name: "예약 확인하기",
        type: "WL",
        url_mobile: `${process.env.NEXT_PUBLIC_API_URL}/bookings/${params.bookingId}`,
        url_pc: `${process.env.NEXT_PUBLIC_API_URL}/bookings/${params.bookingId}`,
      },
      {
        name: "길찾기",
        type: "WL",
        url_mobile: `https://map.kakao.com/link/search/${encodeURIComponent(params.propertyAddress)}`,
        url_pc: `https://map.kakao.com/link/search/${encodeURIComponent(params.propertyAddress)}`,
      },
    ],
  });
}
