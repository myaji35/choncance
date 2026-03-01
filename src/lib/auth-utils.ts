import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

type Role = "USER" | "HOST_PENDING" | "HOST" | "ADMIN";

/**
 * 현재 로그인한 사용자의 정보와 역할을 가져옵니다.
 */
export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Clerk에서 이메일 가져오기
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;

  if (!email) return null;

  // 이메일로 DB 사용자 조회 (없으면 자동 생성)
  let user = await prisma.user.findUnique({
    where: { email },
    include: { hostProfile: true },
  }).catch(() => null);

  if (!user && clerkUser) {
    // 최초 로그인 시 사용자 자동 생성
    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email,
        name: clerkUser.fullName || clerkUser.firstName || email.split("@")[0],
        image: clerkUser.imageUrl,
        provider: "clerk",
      },
      include: { hostProfile: true },
    }).catch(() => null);
  }

  return user;
}

/**
 * 현재 사용자가 특정 역할을 가지고 있는지 확인합니다.
 */
export async function hasRole(requiredRole: Role | Role[]): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.includes(user.role as Role);
}

export async function isUser(): Promise<boolean> {
  return hasRole("USER");
}

export async function isHost(): Promise<boolean> {
  return hasRole("HOST");
}

export async function isHostPending(): Promise<boolean> {
  return hasRole("HOST_PENDING");
}

export async function isHostOrPending(): Promise<boolean> {
  return hasRole(["HOST", "HOST_PENDING"]);
}

export async function isAdmin(): Promise<boolean> {
  return hasRole("ADMIN");
}

export async function requireRole(
  requiredRole: Role | Role[],
  redirectUrl: string = "/login"
): Promise<void> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(redirectUrl);
  }

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  if (!roles.includes(user.role as Role)) {
    switch (user.role) {
      case "ADMIN":
        redirect("/admin");
      case "HOST":
        redirect("/host/dashboard");
      case "HOST_PENDING":
        redirect("/become-a-host/pending");
      case "USER":
      default:
        redirect("/dashboard");
    }
  }
}

export async function requireHost(): Promise<void> {
  await requireRole("HOST");
}

export async function requireAdmin(): Promise<void> {
  await requireRole("ADMIN");
}

export async function requireUser(): Promise<void> {
  await requireRole("USER");
}

export async function requireAuth(): Promise<void> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }
}

export async function getUserRole(): Promise<Role | null> {
  const user = await getCurrentUser();
  return (user?.role as Role) || null;
}

export function getRoleHomePage(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "HOST":
      return "/host/dashboard";
    case "HOST_PENDING":
      return "/become-a-host/pending";
    case "USER":
    default:
      return "/dashboard";
  }
}

export function getRoleDisplayName(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "관리자";
    case "HOST":
      return "호스트";
    case "HOST_PENDING":
      return "호스트 승인 대기";
    case "USER":
      return "일반 사용자";
    default:
      return "사용자";
  }
}
