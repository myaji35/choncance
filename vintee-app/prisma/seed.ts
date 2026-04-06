import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.resolve(__dirname, "../dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  const pw = await bcrypt.hash("password123", 12);

  // 호스트 생성
  const host = await prisma.user.upsert({
    where: { email: "host@vintee.kr" },
    update: {},
    create: {
      email: "host@vintee.kr",
      password: pw,
      name: "김호스트",
      role: "HOST",
    },
  });

  // 게스트 생성
  const guest = await prisma.user.upsert({
    where: { email: "guest@vintee.kr" },
    update: {},
    create: {
      email: "guest@vintee.kr",
      password: pw,
      name: "홍길동",
      role: "GUEST",
    },
  });

  // 숙소 생성
  const property = await prisma.property.upsert({
    where: { id: "prop-demo-001" },
    update: {},
    create: {
      id: "prop-demo-001",
      title: "논뷰 한옥 펜션",
      description:
        "넓은 논 풍경이 펼쳐지는 전통 한옥 펜션입니다. 자연 속에서 힐링하세요.",
      location: "충남 아산",
      address: "충남 아산시 탕정면 매곡리 123",
      latitude: 36.785,
      longitude: 127.004,
      pricePerNight: 120000,
      status: "active",
      hostId: host.id,
    },
  });

  // 완료된 예약 생성
  const booking = await prisma.booking.upsert({
    where: { id: "book-demo-001" },
    update: {},
    create: {
      id: "book-demo-001",
      status: "COMPLETED",
      checkIn: new Date("2026-03-01"),
      checkOut: new Date("2026-03-03"),
      userId: guest.id,
      propertyId: property.id,
    },
  });

  console.log("시드 데이터 생성 완료:", {
    host: host.id,
    guest: guest.id,
    property: property.id,
    booking: booking.id,
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
