import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.resolve(__dirname, "../dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  const pw = await bcrypt.hash("password123", 12);

  // ─── 사용자 ───
  const host = await prisma.user.upsert({
    where: { email: "host@vintee.kr" },
    update: {},
    create: { email: "host@vintee.kr", password: pw, name: "김호스트", role: "HOST" },
  });

  const host2 = await prisma.user.upsert({
    where: { email: "host2@vintee.kr" },
    update: {},
    create: { email: "host2@vintee.kr", password: pw, name: "박호스트", role: "HOST" },
  });

  const guest = await prisma.user.upsert({
    where: { email: "guest@vintee.kr" },
    update: {},
    create: { email: "guest@vintee.kr", password: pw, name: "홍길동", role: "GUEST" },
  });

  const guest2 = await prisma.user.upsert({
    where: { email: "guest2@vintee.kr" },
    update: {},
    create: { email: "guest2@vintee.kr", password: pw, name: "이영희", role: "GUEST" },
  });

  const guest3 = await prisma.user.upsert({
    where: { email: "guest3@vintee.kr" },
    update: {},
    create: { email: "guest3@vintee.kr", password: pw, name: "김철수", role: "GUEST" },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@vintee.kr" },
    update: {},
    create: { email: "admin@vintee.kr", password: pw, name: "관리자", role: "ADMIN" },
  });

  // ─── 숙소 5개 ───
  const properties = [
    {
      id: "prop-001",
      title: "논뷰 한옥 펜션",
      description: "넓은 논 풍경이 펼쳐지는 전통 한옥 펜션입니다. 자연 속에서 힐링하세요. 마당에서 바비큐도 가능하며, 전통 한옥의 아름다움을 느낄 수 있습니다.",
      location: "충남 아산",
      address: "충남 아산시 탕정면 매곡리 123",
      pricePerNight: 120000,
      maxGuests: 6,
      phone: "010-1234-5678",
      hostId: host.id,
    },
    {
      id: "prop-002",
      title: "산골 오두막",
      description: "깊은 산속 아늑한 오두막에서 별을 바라보며 쉬어가세요. 트레킹 코스와 인접해 있어 자연을 만끽하기 좋습니다.",
      location: "강원 평창",
      address: "강원도 평창군 진부면 동산리 456",
      pricePerNight: 80000,
      maxGuests: 4,
      phone: "010-2345-6789",
      hostId: host.id,
    },
    {
      id: "prop-003",
      title: "바다 근처 민박",
      description: "통영 바다가 한눈에 보이는 민박입니다. 신선한 해산물과 함께 여유로운 시간을 보내세요.",
      location: "경남 통영",
      address: "경남 통영시 산양면 해안로 789",
      pricePerNight: 100000,
      maxGuests: 5,
      hostId: host2.id,
    },
    {
      id: "prop-004",
      title: "감귤 농장 스테이",
      description: "제주 감귤 농장 안에 위치한 독채 숙소입니다. 감귤 따기 체험과 함께 제주의 자연을 즐겨보세요.",
      location: "제주 서귀포",
      address: "제주 서귀포시 남원읍 감귤로 101",
      pricePerNight: 150000,
      maxGuests: 4,
      hostId: host2.id,
    },
    {
      id: "prop-005",
      title: "대나무 숲 글램핑",
      description: "담양 대나무 숲 속 프라이빗 글램핑장입니다. 대나무 바람 소리를 들으며 특별한 하룻밤을 보내세요.",
      location: "전남 담양",
      address: "전남 담양군 담양읍 죽녹원로 55",
      pricePerNight: 90000,
      maxGuests: 3,
      phone: "010-3456-7890",
      hostId: host.id,
    },
  ];

  for (const p of properties) {
    await prisma.property.upsert({
      where: { id: p.id },
      update: {},
      create: { ...p, status: "active", latitude: 35 + Math.random() * 3, longitude: 126 + Math.random() * 3 },
    });
  }

  // ─── 예약 ───
  const bookings = [
    { id: "book-001", userId: guest.id, propertyId: "prop-001", status: "COMPLETED", checkIn: "2026-02-10", checkOut: "2026-02-12", guestCount: 2, totalPrice: 240000 },
    { id: "book-002", userId: guest2.id, propertyId: "prop-001", status: "COMPLETED", checkIn: "2026-02-20", checkOut: "2026-02-22", guestCount: 4, totalPrice: 240000 },
    { id: "book-003", userId: guest3.id, propertyId: "prop-002", status: "COMPLETED", checkIn: "2026-03-01", checkOut: "2026-03-03", guestCount: 2, totalPrice: 160000 },
    { id: "book-004", userId: guest.id, propertyId: "prop-003", status: "COMPLETED", checkIn: "2026-03-05", checkOut: "2026-03-07", guestCount: 3, totalPrice: 200000 },
    { id: "book-005", userId: guest2.id, propertyId: "prop-004", status: "CONFIRMED", checkIn: "2026-05-01", checkOut: "2026-05-03", guestCount: 2, totalPrice: 300000 },
    { id: "book-006", userId: guest3.id, propertyId: "prop-005", status: "PENDING", checkIn: "2026-05-10", checkOut: "2026-05-12", guestCount: 2, totalPrice: 180000 },
  ];

  for (const b of bookings) {
    await prisma.booking.upsert({
      where: { id: b.id },
      update: {},
      create: { ...b, checkIn: new Date(b.checkIn), checkOut: new Date(b.checkOut) },
    });
  }

  // ─── 리뷰 ───
  const reviews = [
    { bookingId: "book-001", userId: guest.id, propertyId: "prop-001", rating: 5, content: "논 풍경이 정말 아름다웠어요. 한옥의 멋을 느끼며 편안하게 쉴 수 있었습니다. 바비큐도 최고였어요! 다음에 또 오고 싶어요." },
    { bookingId: "book-002", userId: guest2.id, propertyId: "prop-001", rating: 4, content: "한옥 분위기가 너무 좋았습니다. 아이들도 마당에서 뛰어놀 수 있어서 가족 여행으로 딱이었어요. 다만 화장실이 조금 좁았습니다." },
    { bookingId: "book-003", userId: guest3.id, propertyId: "prop-002", rating: 5, content: "산 속 오두막에서 보내는 시간이 정말 힐링이었어요. 밤에 별이 쏟아지는 것 같았어요. 트레킹 코스도 좋았습니다." },
    { bookingId: "book-004", userId: guest.id, propertyId: "prop-003", rating: 4, content: "통영 바다 뷰가 끝내줍니다. 회도 신선하고, 호스트분이 친절하게 맛집도 알려주셨어요. 재방문 의사 있습니다!" },
  ];

  for (const r of reviews) {
    const exists = await prisma.review.findUnique({ where: { bookingId: r.bookingId } });
    if (!exists) {
      await prisma.review.create({ data: r });
    }
  }

  // 호스트 답글
  const review1 = await prisma.review.findUnique({ where: { bookingId: "book-001" } });
  if (review1 && !review1.hostReply) {
    await prisma.review.update({
      where: { id: review1.id },
      data: { hostReply: "감사합니다! 다음에 오시면 더 좋은 서비스로 모시겠습니다. 바비큐 장작도 넉넉히 준비해 놓을게요.", repliedAt: new Date() },
    });
  }

  console.log("시드 데이터 생성 완료:", {
    users: [host.email, host2.email, guest.email, guest2.email, guest3.email, admin.email],
    properties: properties.length,
    bookings: bookings.length,
    reviews: reviews.length,
  });
  console.log("\n데모 계정: host@vintee.kr / guest@vintee.kr / admin@vintee.kr (비밀번호: password123)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
