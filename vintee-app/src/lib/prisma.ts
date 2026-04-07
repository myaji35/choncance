import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// libSQL file URI 파서가 경로 특수문자(괄호/공백/한글)를 처리 못하므로
// /tmp/vintee-dev.db 심볼릭 링크를 우회로 사용 (dev 환경)
// 실제 DB는 `ln -sf "$(pwd)/dev.db" /tmp/vintee-dev.db`로 연결
const dbPath =
  process.env.DATABASE_FILE ??
  (process.cwd().includes("(") ? "/tmp/vintee-dev.db" : path.resolve(process.cwd(), "dev.db"));
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
