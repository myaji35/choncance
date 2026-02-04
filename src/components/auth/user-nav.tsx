'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function UserNav() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return null;
  }

  if (status === 'unauthenticated') {
    return (
      <Link href="/login" passHref>
        <Button>로그인</Button>
      </Link>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {session?.user?.role !== 'HOST' && session?.user?.role !== 'HOST_PENDING' && (
        <Link href="/become-a-host" passHref>
          <Button variant="ghost">호스트 되기</Button>
        </Link>
      )}
      <Link href="/dashboard" passHref>
        <Button variant="ghost">대시보드</Button>
      </Link>
      <Button onClick={() => signOut()}>로그아웃</Button>
    </div>
  );
}
