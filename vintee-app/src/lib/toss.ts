// ISS-041: 토스페이먼츠 결제 adapter
// TOSS_SECRET_KEY 환경변수 있으면 실제 API 호출, 없으면 mock (즉시 paid 처리)
//
// 토스페이먼츠 결제 승인 API
// POST https://api.tosspayments.com/v1/payments/confirm
// Authorization: Basic base64(secretKey:)
// Body: { paymentKey, orderId, amount }

const TOSS_API_BASE = "https://api.tosspayments.com/v1";

export interface TossConfirmResult {
  ok: boolean;
  paymentKey?: string;
  method?: string;
  approvedAt?: string;
  rawResponse?: string;
  error?: string;
}

export interface TossCancelResult {
  ok: boolean;
  canceledAt?: string;
  rawResponse?: string;
  error?: string;
}

function secretHeader(): string | null {
  const key = process.env.TOSS_SECRET_KEY;
  if (!key) return null;
  const encoded = Buffer.from(`${key}:`).toString("base64");
  return `Basic ${encoded}`;
}

export function isTossEnabled(): boolean {
  return !!process.env.TOSS_SECRET_KEY;
}

/**
 * 결제 승인 — 토스 위젯이 성공 콜백으로 paymentKey를 보내면 서버가 이걸로 승인 API 호출
 * 환경변수 없으면 mock 즉시 성공 반환
 */
export async function confirmTossPayment(args: {
  paymentKey: string;
  orderId: string;
  amount: number;
}): Promise<TossConfirmResult> {
  const auth = secretHeader();
  if (!auth) {
    // Mock: dev 환경에선 항상 성공 처리
    return {
      ok: true,
      paymentKey: args.paymentKey,
      method: "MOCK",
      approvedAt: new Date().toISOString(),
      rawResponse: JSON.stringify({ mock: true, ...args }),
    };
  }

  try {
    const res = await fetch(`${TOSS_API_BASE}/payments/confirm`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentKey: args.paymentKey,
        orderId: args.orderId,
        amount: args.amount,
      }),
    });
    const raw = await res.text();
    if (!res.ok) {
      console.error("[toss] confirm failed:", res.status, raw);
      return { ok: false, error: `Toss ${res.status}: ${raw}`, rawResponse: raw };
    }
    const data = JSON.parse(raw) as {
      paymentKey?: string;
      method?: string;
      approvedAt?: string;
    };
    return {
      ok: true,
      paymentKey: data.paymentKey,
      method: data.method,
      approvedAt: data.approvedAt,
      rawResponse: raw,
    };
  } catch (err) {
    console.error("[toss] confirm error:", err);
    return { ok: false, error: String(err) };
  }
}

/** 결제 취소/환불 */
export async function cancelTossPayment(args: {
  paymentKey: string;
  cancelReason: string;
}): Promise<TossCancelResult> {
  const auth = secretHeader();
  if (!auth) {
    return {
      ok: true,
      canceledAt: new Date().toISOString(),
      rawResponse: JSON.stringify({ mock: true, ...args }),
    };
  }

  try {
    const res = await fetch(
      `${TOSS_API_BASE}/payments/${args.paymentKey}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cancelReason: args.cancelReason }),
      }
    );
    const raw = await res.text();
    if (!res.ok) {
      console.error("[toss] cancel failed:", res.status, raw);
      return { ok: false, error: `Toss ${res.status}: ${raw}`, rawResponse: raw };
    }
    return { ok: true, canceledAt: new Date().toISOString(), rawResponse: raw };
  } catch (err) {
    console.error("[toss] cancel error:", err);
    return { ok: false, error: String(err) };
  }
}
