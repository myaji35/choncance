/**
 * Clerk 기반 인증 헬퍼 (Supabase auth-helpers 호환 인터페이스)
 * 기존 코드의 drop-in replacement
 */
import { auth, currentUser as clerkCurrentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

/**
 * 현재 로그인한 사용자를 반환합니다.
 * 기존 Supabase getUser()와 동일한 인터페이스를 유지합니다.
 */
export async function getUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const clerkUser = await clerkCurrentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;

  if (!email) return null;

  // DB에서 사용자 조회 (없으면 자동 생성)
  let dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { clerkId: userId },
        { email },
      ],
    },
  }).catch(() => null);

  if (!dbUser && clerkUser) {
    dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email,
        name: clerkUser.fullName || clerkUser.firstName || email.split("@")[0],
        image: clerkUser.imageUrl,
        provider: "clerk",
      },
    }).catch(() => null);
  } else if (dbUser && !dbUser.clerkId) {
    // 기존 사용자에 clerkId 업데이트
    dbUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: { clerkId: userId },
    }).catch(() => dbUser);
  }

  if (!dbUser) return null;

  // 기존 Supabase 코드 호환: { ...clerkUser, profile: dbUser }
  return {
    id: userId,
    email,
    profile: dbUser,
  };
}

export async function requireAuth() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await getUser();

  if (!user || user.profile?.role !== "ADMIN") {
    redirect("/");
  }

  return user;
}

export async function requireHost() {
  const user = await getUser();

  if (!user || (user.profile?.role !== "HOST" && user.profile?.role !== "HOST_PENDING")) {
    redirect("/");
  }

  return user;
}
