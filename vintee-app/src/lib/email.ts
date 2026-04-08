// ISS-023: 호스트/게스트 알림 이메일 어댑터
// RESEND_API_KEY 환경변수가 있으면 Resend HTTP API 사용,
// 없으면 console에 출력 (개발/테스트). 운영 시 키만 추가하면 동작.
//
// brand voice: 다정하지만 똑똑한 동네 친구. 과장 금지.

const RESEND_ENDPOINT = "https://api.resend.com/emails";

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface SendResult {
  ok: boolean;
  id?: string;
  reason?: string;
}

const FROM = process.env.EMAIL_FROM ?? "VINTEE <noreply@vintee.kr>";

export async function sendEmail(args: SendArgs): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Dev fallback — 메일 전송 없이 로그
    console.log(`[email:dev] to=${args.to} subject=${args.subject}`);
    return { ok: true, id: "dev-noop" };
  }
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [args.to],
        subject: args.subject,
        html: args.html,
        text: args.text,
      }),
    });
    if (!res.ok) {
      const reason = await res.text();
      console.error(`[email] Resend ${res.status}: ${reason}`);
      return { ok: false, reason };
    }
    const data = (await res.json()) as { id?: string };
    return { ok: true, id: data.id };
  } catch (err) {
    console.error("[email] send error:", err);
    return { ok: false, reason: String(err) };
  }
}

// ─── 템플릿 ───

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002";

function brandLayout(title: string, body: string) {
  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#F5F1E8;font-family:-apple-system,BlinkMacSystemFont,'Pretendard',sans-serif;color:#1F2937;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="text-align:left;padding-bottom:16px;border-bottom:2px solid #4A6741;">
      <span style="font-size:20px;font-weight:bold;color:#4A6741;">VINTEE</span>
      <span style="font-size:12px;color:#6B7280;margin-left:8px;">한국형 촌캉스 큐레이션</span>
    </div>
    <div style="padding:24px 0;line-height:1.7;font-size:15px;">${body}</div>
    <div style="padding-top:20px;border-top:1px solid #E5E7EB;font-size:12px;color:#9CA3AF;">
      이 메일은 VINTEE 예약/리뷰 활동에 따라 자동 발송됩니다.<br>
      <a href="${SITE_URL}" style="color:#4A6741;">vintee.kr</a>
    </div>
  </div>
</body></html>`;
}

export function tplNewBookingToHost(args: {
  hostName: string;
  guestName: string;
  propertyTitle: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  bookingId: string;
}) {
  const subject = `새 예약이 들어왔어요 — ${args.propertyTitle}`;
  const body = `
    <p>${args.hostName}님, 새 예약 한 건이 도착했어요.</p>
    <div style="background:#F5F1E8;border-left:3px solid #4A6741;padding:14px 16px;border-radius:6px;margin:14px 0;">
      <strong>${args.propertyTitle}</strong><br>
      ${args.guestName}님 · ${args.checkIn} ~ ${args.checkOut} · ${args.guestCount}명
    </div>
    <p>가능한 빨리 응답해주시면 손님이 더 좋아할 거예요.</p>
    <p style="margin-top:20px;">
      <a href="${SITE_URL}/host/bookings"
         style="display:inline-block;background:#D97B3F;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:bold;">
        예약 응답하러 가기 →
      </a>
    </p>`;
  return { subject, html: brandLayout(subject, body) };
}

export function tplBookingDecisionToGuest(args: {
  guestName: string;
  propertyTitle: string;
  checkIn: string;
  checkOut: string;
  decision: "CONFIRMED" | "CANCELLED";
  bookingId: string;
}) {
  const isOk = args.decision === "CONFIRMED";
  const subject = isOk
    ? `예약이 확정되었어요 — ${args.propertyTitle}`
    : `예약이 취소되었어요 — ${args.propertyTitle}`;
  const body = isOk
    ? `
    <p>${args.guestName}님, 호스트가 예약을 확정했어요.</p>
    <div style="background:#F5F1E8;border-left:3px solid #4A6741;padding:14px 16px;border-radius:6px;margin:14px 0;">
      <strong>${args.propertyTitle}</strong><br>
      ${args.checkIn} ~ ${args.checkOut}
    </div>
    <p>여행 준비 잘 하시고, 다녀오신 후엔 후기로 다른 분들도 도와주세요.</p>
    <p style="margin-top:20px;">
      <a href="${SITE_URL}/bookings/${args.bookingId}"
         style="display:inline-block;background:#4A6741;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:bold;">
        예약 상세 보기 →
      </a>
    </p>`
    : `
    <p>${args.guestName}님, 안타깝게도 호스트가 이 날짜는 어렵다고 해요.</p>
    <div style="background:#F5F1E8;border-left:3px solid #4A6741;padding:14px 16px;border-radius:6px;margin:14px 0;">
      <strong>${args.propertyTitle}</strong><br>
      ${args.checkIn} ~ ${args.checkOut}
    </div>
    <p>다른 좋은 곳을 함께 찾아드릴게요.</p>
    <p style="margin-top:20px;">
      <a href="${SITE_URL}/#ai-search"
         style="display:inline-block;background:#D97B3F;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:bold;">
        VINTEE AI에게 다시 물어보기 →
      </a>
    </p>`;
  return { subject, html: brandLayout(subject, body) };
}

export function tplNewReviewToHost(args: {
  hostName: string;
  propertyTitle: string;
  rating: number;
  guestName: string;
  contentPreview: string;
}) {
  const stars = "★".repeat(args.rating) + "☆".repeat(5 - args.rating);
  const subject = `새 후기가 도착했어요 (${stars}) — ${args.propertyTitle}`;
  const body = `
    <p>${args.hostName}님, ${args.propertyTitle}에 새 후기가 등록됐어요.</p>
    <div style="background:#F5F1E8;border-left:3px solid #4A6741;padding:14px 16px;border-radius:6px;margin:14px 0;">
      <div style="color:#D97B3F;font-size:18px;">${stars}</div>
      <div style="font-size:13px;color:#6B7280;margin-top:4px;">${args.guestName}님</div>
      <p style="margin:10px 0 0 0;font-style:italic;">&ldquo;${args.contentPreview}&rdquo;</p>
    </div>
    <p>답글을 남겨주시면 GEO 점수가 올라가고, AI 추천에서도 더 자주 나오게 돼요.</p>
    <p style="margin-top:20px;">
      <a href="${SITE_URL}/host/reviews"
         style="display:inline-block;background:#4A6741;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:bold;">
        답글 작성하러 가기 →
      </a>
    </p>`;
  return { subject, html: brandLayout(subject, body) };
}
