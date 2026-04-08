// ISS-020: 간단한 in-memory rate limiter
// 운영 시 Vercel KV/Upstash Redis로 교체 권장 (현재 단일 인스턴스 가정)

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// 주기적 청소 (메모리 누수 방지)
let lastCleanup = Date.now();
function maybeCleanup() {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [key, b] of buckets.entries()) {
    if (b.resetAt < now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * key 기준 sliding window 카운터
 * @param key 일반적으로 IP + endpoint
 * @param max  허용 횟수
 * @param windowMs 윈도우 길이 (ms)
 */
export function rateLimit(key: string, max: number, windowMs: number): RateLimitResult {
  maybeCleanup();
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs };
  }
  if (b.count >= max) {
    return { allowed: false, remaining: 0, resetAt: b.resetAt };
  }
  b.count += 1;
  return { allowed: true, remaining: max - b.count, resetAt: b.resetAt };
}

/** 요청에서 클라이언트 IP 추출 (Vercel/일반 프록시) */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
