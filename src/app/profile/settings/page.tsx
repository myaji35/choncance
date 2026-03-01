"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/login');
    }
  }, [isLoaded, user, router]);

  if (!isLoaded || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link href="/profile">
          <Button variant="ghost" size="sm" className="mb-4">
            ← 프로필로 돌아가기
          </Button>
        </Link>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">프로필 설정</h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
              <p className="text-gray-900">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
              <p className="text-gray-900">{user.fullName || user.firstName || '-'}</p>
            </div>

            <div className="pt-4">
              <p className="text-sm text-gray-500">
                프로필 설정은 Clerk 대시보드에서 관리됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
