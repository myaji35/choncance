/**
 * 리뷰 시스템 유틸리티 함수
 */

/**
 * 이름 마스킹 처리 (개인정보 보호)
 * 예: "홍길동" -> "홍*동", "김" -> "김", "이영희" -> "이*희"
 */
export function maskName(name: string | null | undefined): string {
  if (!name) return "익명";
  if (name.length === 1) return name;
  if (name.length === 2) return name[0] + "*";
  // 3자 이상: 첫 글자 + * + 마지막 글자
  return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
}

/**
 * 별점 포맷 (소수점 1자리)
 * 예: 4.333... -> "4.3"
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/**
 * 리뷰 작성 가능 여부 확인
 */
export function canWriteReview(booking: {
  status: string;
  checkOut: Date | string;
  review?: unknown;
}): { allowed: boolean; reason?: string } {
  if (booking.review) {
    return { allowed: false, reason: "이미 리뷰를 작성하셨습니다." };
  }
  if (booking.status !== "COMPLETED") {
    return { allowed: false, reason: "완료된 예약만 리뷰를 작성할 수 있습니다." };
  }
  if (new Date(booking.checkOut) > new Date()) {
    return { allowed: false, reason: "체크아웃 후 리뷰를 작성할 수 있습니다." };
  }
  return { allowed: true };
}
