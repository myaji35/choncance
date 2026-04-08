// ISS-042: 호스트 정산 집계
import { prisma } from "./prisma";

export interface PayoutMonth {
  yearMonth: string;        // "2026-04"
  bookingCount: number;
  grossAmount: number;      // 총 결제 금액
  commission: number;       // VINTEE 수수료
  netAmount: number;        // 호스트 순수익
  paidCount: number;        // 결제 완료된 예약 수
}

export interface PayoutSummary {
  thisMonth: PayoutMonth;
  lastMonth: PayoutMonth | null;
  last6Months: PayoutMonth[];
  pendingPayoutAmount: number;  // 미정산 금액
  nextPayoutDate: string;       // 다음 정산일 (매월 10일)
  totalLifetimeNet: number;
}

function ym(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function emptyMonth(yearMonth: string): PayoutMonth {
  return {
    yearMonth,
    bookingCount: 0,
    grossAmount: 0,
    commission: 0,
    netAmount: 0,
    paidCount: 0,
  };
}

/** 다음 정산일 = 다음달 10일 */
function nextPayoutDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(10);
  return d.toISOString().slice(0, 10);
}

export async function getHostPayouts(hostId: string): Promise<PayoutSummary> {
  // 호스트 숙소 목록
  const properties = await prisma.property.findMany({
    where: { hostId },
    select: { id: true },
  });
  if (properties.length === 0) {
    const now = new Date();
    return {
      thisMonth: emptyMonth(ym(now)),
      lastMonth: null,
      last6Months: [],
      pendingPayoutAmount: 0,
      nextPayoutDate: nextPayoutDate(),
      totalLifetimeNet: 0,
    };
  }
  const propertyIds = properties.map((p) => p.id);

  // 최근 6개월 booking (결제 상태 포함)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const bookings = await prisma.booking.findMany({
    where: {
      propertyId: { in: propertyIds },
      createdAt: { gte: sixMonthsAgo },
    },
    select: {
      id: true,
      totalPrice: true,
      commissionRate: true,
      paymentStatus: true,
      status: true,
      createdAt: true,
    },
  });

  // 월별 집계
  const monthMap = new Map<string, PayoutMonth>();
  let pending = 0;
  let lifetimeNet = 0;

  for (const b of bookings) {
    const key = ym(b.createdAt);
    const m = monthMap.get(key) ?? emptyMonth(key);
    m.bookingCount += 1;

    // 결제 완료만 수익 집계 (status CANCELLED 제외)
    if (b.paymentStatus === "paid" && b.status !== "CANCELLED") {
      const gross = b.totalPrice;
      const commission = Math.round((gross * b.commissionRate) / 100);
      const net = gross - commission;
      m.grossAmount += gross;
      m.commission += commission;
      m.netAmount += net;
      m.paidCount += 1;
      lifetimeNet += net;

      // 이번 달 정산 대기 (아직 정산 안 된 것)
      const now = new Date();
      if (key === ym(now)) {
        pending += net;
      }
    }
    monthMap.set(key, m);
  }

  // 정렬: 최근 순
  const sortedMonths = Array.from(monthMap.values()).sort((a, b) =>
    b.yearMonth.localeCompare(a.yearMonth)
  );

  const now = new Date();
  const thisYm = ym(now);
  const lastYmDate = new Date();
  lastYmDate.setMonth(lastYmDate.getMonth() - 1);
  const lastYm = ym(lastYmDate);

  return {
    thisMonth: monthMap.get(thisYm) ?? emptyMonth(thisYm),
    lastMonth: monthMap.get(lastYm) ?? null,
    last6Months: sortedMonths,
    pendingPayoutAmount: pending,
    nextPayoutDate: nextPayoutDate(),
    totalLifetimeNet: lifetimeNet,
  };
}
