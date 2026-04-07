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

  // ─── 숙소 5개 (GEO 필드 포함) ───
  const properties = [
    {
      id: "prop-001",
      title: "논뷰 한옥 펜션",
      description: "넓은 논 풍경이 펼쳐지는 전통 한옥 펜션입니다. 자연 속에서 힐링하세요. 마당에서 바비큐도 가능하며, 전통 한옥의 아름다움을 느낄 수 있습니다. 봄에는 모내기, 가을에는 황금 들녘을 감상할 수 있어 사계절 내내 색다른 풍경을 선사합니다.",
      location: "충남 아산",
      address: "충남 아산시 탕정면 매곡리 123",
      latitude: 36.7898,
      longitude: 127.0042,
      pricePerNight: 120000,
      maxGuests: 6,
      phone: "010-1234-5678",
      hostId: host.id,
      checkinTime: "15:00",
      checkoutTime: "11:00",
      highlights: JSON.stringify(["논뷰 전망", "바비큐 가능", "온돌 체험", "전통 한옥"]),
      nearbyAttractions: JSON.stringify([
        { name: "현충사", distance: "차로 15분" },
        { name: "아산온천", distance: "차로 10분" },
      ]),
      bestSeason: "사계절",
      hostIntro: "아산에서 3대째 한옥을 운영하고 있는 김호스트입니다. 우리 가족이 직접 농사 지은 쌀과 채소로 따뜻한 환영을 준비합니다.",
      uniqueExperience: "한복 입기, 다도 체험",
      petsAllowed: false,
      numberOfRooms: 3,
    },
    {
      id: "prop-002",
      title: "산골 오두막",
      description: "깊은 산속 아늑한 오두막에서 별을 바라보며 쉬어가세요. 트레킹 코스와 인접해 있어 자연을 만끽하기 좋습니다. 도시의 빛 공해가 없어 은하수도 선명하게 볼 수 있습니다.",
      location: "강원 평창",
      address: "강원도 평창군 진부면 동산리 456",
      latitude: 37.6418,
      longitude: 128.5919,
      pricePerNight: 80000,
      maxGuests: 4,
      phone: "010-2345-6789",
      hostId: host.id,
      checkinTime: "16:00",
      checkoutTime: "11:00",
      highlights: JSON.stringify(["별 관측", "트레킹 코스", "벽난로"]),
      nearbyAttractions: JSON.stringify([
        { name: "오대산 국립공원", distance: "차로 20분" },
        { name: "월정사", distance: "차로 25분" },
      ]),
      bestSeason: "봄/가을",
      hostIntro: "산을 사랑하는 평창 토박이입니다. 트레킹 코스와 맛집을 자세히 안내해 드립니다.",
      uniqueExperience: "야간 별 관측, 모닥불",
      petsAllowed: true,
      numberOfRooms: 2,
    },
    {
      id: "prop-003",
      title: "바다 근처 민박",
      description: "통영 바다가 한눈에 보이는 민박입니다. 신선한 해산물과 함께 여유로운 시간을 보내세요. 새벽에는 어선이 들어오는 모습을 직접 볼 수 있는 진짜 어촌 체험 숙소입니다.",
      location: "경남 통영",
      address: "경남 통영시 산양면 해안로 789",
      latitude: 34.7945,
      longitude: 128.3958,
      pricePerNight: 100000,
      maxGuests: 5,
      hostId: host2.id,
      checkinTime: "15:00",
      checkoutTime: "10:00",
      highlights: JSON.stringify(["오션뷰", "해산물 조식", "테라스"]),
      nearbyAttractions: JSON.stringify([
        { name: "동피랑 벽화마을", distance: "차로 15분" },
        { name: "케이블카", distance: "차로 20분" },
      ]),
      bestSeason: "여름",
      hostIntro: "통영에서 30년 어업을 하다가 민박을 시작했습니다. 신선한 해산물은 자신 있습니다.",
      uniqueExperience: "어선 체험, 해산물 손질",
      petsAllowed: false,
      numberOfRooms: 2,
    },
    {
      id: "prop-004",
      title: "감귤 농장 스테이",
      description: "제주 감귤 농장 안에 위치한 독채 숙소입니다. 감귤 따기 체험과 함께 제주의 자연을 즐겨보세요. 11월부터 1월까지는 제철 감귤을 마음껏 따서 드실 수 있습니다.",
      location: "제주 서귀포",
      address: "제주 서귀포시 남원읍 감귤로 101",
      latitude: 33.2870,
      longitude: 126.6960,
      pricePerNight: 150000,
      maxGuests: 4,
      hostId: host2.id,
      checkinTime: "15:00",
      checkoutTime: "11:00",
      highlights: JSON.stringify(["감귤 농장", "독채", "프라이빗 마당", "제주 전통식"]),
      nearbyAttractions: JSON.stringify([
        { name: "쇠소깍", distance: "차로 10분" },
        { name: "정방폭포", distance: "차로 15분" },
      ]),
      bestSeason: "가을",
      hostIntro: "3대째 감귤 농사를 짓고 있는 제주 토박이 호스트입니다. 무농약 감귤로 만든 잼과 청을 선물로 드립니다.",
      uniqueExperience: "감귤 따기, 감귤청 만들기",
      petsAllowed: true,
      numberOfRooms: 1,
    },
    {
      id: "prop-005",
      title: "대나무 숲 글램핑",
      description: "담양 대나무 숲 속 프라이빗 글램핑장입니다. 대나무 바람 소리를 들으며 특별한 하룻밤을 보내세요. 죽녹원이 도보 5분 거리에 있어 산책하기 좋습니다.",
      location: "전남 담양",
      address: "전남 담양군 담양읍 죽녹원로 55",
      latitude: 35.3210,
      longitude: 126.9881,
      pricePerNight: 90000,
      maxGuests: 3,
      phone: "010-3456-7890",
      hostId: host.id,
      checkinTime: "15:00",
      checkoutTime: "11:00",
      highlights: JSON.stringify(["대나무 숲", "글램핑", "바비큐"]),
      nearbyAttractions: JSON.stringify([
        { name: "죽녹원", distance: "도보 5분" },
        { name: "메타세콰이어 길", distance: "차로 10분" },
      ]),
      bestSeason: "봄/가을",
      hostIntro: "담양 대나무 숲 한가운데서 자연주의 글램핑을 운영합니다. 미니멀한 휴식을 원하시는 분께 추천합니다.",
      uniqueExperience: "대통밥 짓기, 죽순 채취",
      petsAllowed: false,
      numberOfRooms: 1,
    },
  ];

  for (const p of properties) {
    await prisma.property.upsert({
      where: { id: p.id },
      update: {
        checkinTime: p.checkinTime,
        checkoutTime: p.checkoutTime,
        highlights: p.highlights,
        nearbyAttractions: p.nearbyAttractions,
        bestSeason: p.bestSeason,
        hostIntro: p.hostIntro,
        uniqueExperience: p.uniqueExperience,
        petsAllowed: p.petsAllowed,
        numberOfRooms: p.numberOfRooms,
        latitude: p.latitude,
        longitude: p.longitude,
      },
      create: { ...p, status: "active" },
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
