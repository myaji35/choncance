import { getTrelloClient, isTrelloEnabled } from "./client";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export interface BookingCardData {
  id: string;
  propertyName: string;
  guestName: string;
  guestEmail: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalAmount: number;
  status: string;
}

/**
 * 새 예약이 생성되면 Trello 카드를 생성합니다
 */
export async function createBookingCard(
  booking: BookingCardData
): Promise<string | null> {
  if (!isTrelloEnabled()) {
    console.log("Trello is not enabled, skipping card creation");
    return null;
  }

  const trello = getTrelloClient();
  if (!trello) return null;

  try {
    const listId = process.env.TRELLO_NEW_BOOKINGS_LIST_ID;
    if (!listId) {
      console.error("TRELLO_NEW_BOOKINGS_LIST_ID not configured");
      return null;
    }

    // 카드 제목
    const cardName = `[${booking.id.slice(0, 8)}] ${booking.propertyName}`;

    // 카드 설명
    const cardDesc = `
**예약 정보**
- 예약 ID: ${booking.id}
- 게스트: ${booking.guestName}
- 이메일: ${booking.guestEmail}
- 숙소: ${booking.propertyName}
- 게스트 수: ${booking.guests}명

**일정**
- 체크인: ${format(booking.checkIn, "yyyy년 M월 d일 (EEE)", { locale: ko })}
- 체크아웃: ${format(booking.checkOut, "yyyy년 M월 d일 (EEE)", { locale: ko })}

**결제**
- 총 금액: ${booking.totalAmount.toLocaleString()}원
- 상태: ${getStatusLabel(booking.status)}

**링크**
[예약 상세보기](${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3010"}/bookings/${booking.id})
`;

    // 카드 생성
    const card = await trello.addCard(cardName, cardDesc.trim(), listId);

    // 체크인 날짜를 Due Date로 설정
    await trello.updateCard(card.id, "due", booking.checkIn.toISOString());

    // 금액대별 라벨 추가
    await addAmountLabel(card.id, booking.totalAmount);

    console.log(`✅ Trello 카드 생성 완료: ${card.url}`);
    return card.id;
  } catch (error) {
    console.error("❌ Trello 카드 생성 실패:", error);
    return null;
  }
}

/**
 * 예약 상태 변경 시 Trello 카드를 다른 리스트로 이동합니다
 */
export async function updateBookingCardStatus(
  cardId: string,
  newStatus: string
): Promise<boolean> {
  if (!isTrelloEnabled()) return false;

  const trello = getTrelloClient();
  if (!trello) return false;

  try {
    const listMapping: Record<string, string | undefined> = {
      PENDING: process.env.TRELLO_NEW_BOOKINGS_LIST_ID,
      CONFIRMED: process.env.TRELLO_CONFIRMED_LIST_ID,
      CHECKED_IN: process.env.TRELLO_CHECKED_IN_LIST_ID,
      COMPLETED: process.env.TRELLO_COMPLETED_LIST_ID,
      CANCELLED: process.env.TRELLO_CANCELLED_LIST_ID,
    };

    const targetListId = listMapping[newStatus];
    if (targetListId) {
      await trello.updateCard(cardId, "idList", targetListId);
      console.log(`✅ Trello 카드 이동 완료: ${newStatus}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error("❌ Trello 카드 상태 업데이트 실패:", error);
    return false;
  }
}

/**
 * 금액대별 라벨을 카드에 추가합니다
 */
async function addAmountLabel(cardId: string, amount: number): Promise<void> {
  const trello = getTrelloClient();
  if (!trello) return;

  try {
    let labelColor: string;

    if (amount >= 500000) {
      labelColor = "red"; // 고액 예약 (50만원 이상)
    } else if (amount >= 300000) {
      labelColor = "orange"; // 중고액 예약 (30만원 이상)
    } else if (amount >= 150000) {
      labelColor = "yellow"; // 중액 예약 (15만원 이상)
    } else {
      labelColor = "green"; // 일반 예약
    }

    await trello.addLabelToCard(cardId, labelColor);
  } catch (error) {
    console.error("라벨 추가 실패:", error);
  }
}

/**
 * 예약 상태를 한글 라벨로 변환합니다
 */
function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    PENDING: "대기중",
    CONFIRMED: "확정됨",
    CHECKED_IN: "체크인 완료",
    COMPLETED: "완료",
    CANCELLED: "취소됨",
  };

  return statusMap[status] || status;
}
