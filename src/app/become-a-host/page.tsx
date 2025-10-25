'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';

const hostRequestSchema = z.object({
  businessNumber: z.string().min(1, '사업자 등록번호를 입력해주세요'),
  contact: z.string().min(1, '연락처를 입력해주세요'),
});

type HostRequestFormData = z.infer<typeof hostRequestSchema>;

export default function BecomeAHostPage() {
  const router = useRouter();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HostRequestFormData>({
    resolver: zodResolver(hostRequestSchema),
  });

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const onSubmit = async (data: HostRequestFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/request-host', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.error || '호스트 신청에 실패했습니다.');
        return;
      }

      router.push('/dashboard?hostRequest=success');
    } catch (err) {
      setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
      console.error('Host request error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">호스트 되기</CardTitle>
          <CardDescription className="text-center">
            호스트가 되어 숙소를 등록하고 수익을 창출하세요.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="businessNumber">사업자 등록번호</Label>
              <Input
                id="businessNumber"
                type="text"
                placeholder="123-45-67890"
                {...register('businessNumber')}
                disabled={isLoading}
              />
              {errors.businessNumber && (
                <p className="text-sm text-red-500">{errors.businessNumber.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contact">연락처</Label>
              <Input
                id="contact"
                type="text"
                placeholder="010-1234-5678"
                {...register('contact')}
                disabled={isLoading}
              />
              {errors.contact && (
                <p className="text-sm text-red-500">{errors.contact.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '신청 중...' : '호스트 신청하기'}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
