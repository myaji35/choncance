"use client";

import Link from "next/link";
import { useAuth, UserButton, SignInButton } from "@clerk/nextjs";

export default function UserNav() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          로그인
        </button>
      </SignInButton>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <Link href="/bookings" className="text-sm font-medium text-gray-600 hover:text-primary">
        내 예약
      </Link>
      <Link href="/host/dashboard" className="text-sm font-medium text-gray-600 hover:text-primary">
        호스트
      </Link>
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}
