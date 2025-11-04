"use client";

import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Role } from "@prisma/client";

export function UserRoleButton() {
  const { user } = useUser();
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRole() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/user/role");
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.role);
        }
      } catch (error) {
        console.error("Failed to fetch user role:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserRole();
  }, [user]);

  const getRoleDisplayName = (role: Role | null): string => {
    if (!role) return "";

    switch (role) {
      case Role.ADMIN:
        return "관리자";
      case Role.HOST:
        return "호스트";
      case Role.HOST_PENDING:
        return "호스트 승인 대기";
      case Role.USER:
        return "고객";
      default:
        return "";
    }
  };

  const getRoleColor = (role: Role | null): string => {
    if (!role) return "text-gray-600";

    switch (role) {
      case Role.ADMIN:
        return "text-red-600";
      case Role.HOST:
        return "text-blue-600";
      case Role.HOST_PENDING:
        return "text-amber-600";
      case Role.USER:
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: "w-10 h-10",
          },
        }}
      />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">
          {user?.firstName || user?.username || "사용자"}
        </span>
        {!loading && userRole && (
          <span className={`text-xs font-medium ${getRoleColor(userRole)}`}>
            {getRoleDisplayName(userRole)}
          </span>
        )}
      </div>
    </div>
  );
}
