import { getUser } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

/**
 * 현재 로그인한 사용자의 정보와 역할을 가져옵니다.
 */
export async function getCurrentUser() {
  const supabaseUser = await getUser();

  if (!supabaseUser || !supabaseUser.profile) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: supabaseUser.profile.id },
    include: {
      hostProfile: true,
    },
  });

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
  return roles.includes(user.role);
}

/**
 * 현재 사용자가 일반 사용자(USER)인지 확인합니다.
 */
export async function isUser(): Promise<boolean> {
  return hasRole(Role.USER);
}

/**
 * 현재 사용자가 호스트(HOST)인지 확인합니다.
 * HOST_PENDING 상태는 포함하지 않습니다.
 */
export async function isHost(): Promise<boolean> {
  return hasRole(Role.HOST);
}

/**
 * 현재 사용자가 호스트 신청 대기 중(HOST_PENDING)인지 확인합니다.
 */
export async function isHostPending(): Promise<boolean> {
  return hasRole(Role.HOST_PENDING);
}

/**
 * 현재 사용자가 호스트이거나 호스트 신청 대기 중인지 확인합니다.
 */
export async function isHostOrPending(): Promise<boolean> {
  return hasRole([Role.HOST, Role.HOST_PENDING]);
}

/**
 * 현재 사용자가 관리자(ADMIN)인지 확인합니다.
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole(Role.ADMIN);
}

/**
 * 특정 역할을 가진 사용자만 접근 가능하도록 합니다.
 * 권한이 없으면 자동으로 리다이렉트됩니다.
 *
 * @param requiredRole 필요한 역할 (단일 또는 배열)
 * @param redirectUrl 권한이 없을 때 리다이렉트할 URL (기본값: /login)
 */
export async function requireRole(
  requiredRole: Role | Role[],
  redirectUrl: string = "/login"
): Promise<void> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(redirectUrl);
  }

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  if (!roles.includes(user.role)) {
    // 역할에 따라 적절한 페이지로 리다이렉트
    switch (user.role) {
      case Role.ADMIN:
        redirect("/admin");
      case Role.HOST:
        redirect("/host/dashboard");
      case Role.HOST_PENDING:
        redirect("/become-a-host/pending");
      case Role.USER:
      default:
        redirect("/dashboard");
    }
  }
}

/**
 * 호스트 전용 페이지에서 사용합니다.
 * HOST 역할만 허용하며, 다른 역할은 각자의 홈으로 리다이렉트됩니다.
 */
export async function requireHost(): Promise<void> {
  await requireRole(Role.HOST);
}

/**
 * 관리자 전용 페이지에서 사용합니다.
 * ADMIN 역할만 허용하며, 다른 역할은 각자의 홈으로 리다이렉트됩니다.
 */
export async function requireAdmin(): Promise<void> {
  await requireRole(Role.ADMIN);
}

/**
 * 일반 사용자 전용 페이지에서 사용합니다.
 * USER 역할만 허용하며, 다른 역할은 각자의 홈으로 리다이렉트됩니다.
 */
export async function requireUser(): Promise<void> {
  await requireRole(Role.USER);
}

/**
 * 로그인이 필요한 페이지에서 사용합니다.
 * 로그인하지 않은 경우에만 리다이렉트됩니다.
 */
export async function requireAuth(): Promise<void> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }
}

/**
 * 현재 사용자의 역할 정보를 반환합니다.
 */
export async function getUserRole(): Promise<Role | null> {
  const user = await getCurrentUser();
  return user?.role || null;
}

/**
 * 역할에 따른 홈 페이지 URL을 반환합니다.
 */
export function getRoleHomePage(role: Role): string {
  switch (role) {
    case Role.ADMIN:
      return "/admin";
    case Role.HOST:
      return "/host/dashboard";
    case Role.HOST_PENDING:
      return "/become-a-host/pending";
    case Role.USER:
    default:
      return "/dashboard";
  }
}

/**
 * 역할에 따른 표시 이름을 반환합니다.
 */
export function getRoleDisplayName(role: Role): string {
  switch (role) {
    case Role.ADMIN:
      return "관리자";
    case Role.HOST:
      return "호스트";
    case Role.HOST_PENDING:
      return "호스트 승인 대기";
    case Role.USER:
      return "일반 사용자";
    default:
      return "사용자";
  }
}
