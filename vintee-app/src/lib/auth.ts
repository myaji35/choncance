import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

/**
 * 간이 인증: 쿠키의 userId로 사용자 조회
 * 실제 서비스에서는 Clerk/NextAuth 등으로 교체
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
