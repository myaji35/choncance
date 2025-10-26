'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Zod validation schema
const hostRequestSchema = z.object({
  businessNumber: z.string().min(10, '사업자 등록번호는 10자 이상이어야 합니다').max(50, '사업자 등록번호는 50자 이하여야 합니다'),
  contact: z.string().regex(/^\d{3}-\d{4}-\d{4}$/, '전화번호 형식: 010-1234-5678'),
});

type HostRequestFormData = z.infer<typeof hostRequestSchema>;

export default function BecomeAHostPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HostRequestFormData>({
    resolver: zodResolver(hostRequestSchema),
  });

  // Check if user is already authenticated
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const onSubmit = async (data: HostRequestFormData) => {
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/request-host`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_number: data.businessNumber,
          contact: data.contact,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.detail?.code === 'ALREADY_HOST_OR_PENDING') {
          setError('이미 호스트이거나 승인 대기 중입니다.');
        } else if (result.detail?.code === 'HOST_PROFILE_EXISTS') {
          setError('이미 호스트 프로필이 존재합니다.');
        } else {
          setError(result.detail?.message || '호스트 신청에 실패했습니다');
        }
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('서버 연결에 실패했습니다');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-green-600">신청 완료</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 text-sm text-green-700 bg-green-50 rounded-md">
              호스트 계정 신청이 완료되었습니다. 관리자 승인 후 호스트 활동을 시작할 수 있습니다.
            </div>
            <Button
              onClick={() => router.push('/')}
              className="w-full"
            >
              메인 페이지로 이동
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">호스트 되기</CardTitle>
          <CardDescription className="text-center">
            호스트로 등록하여 숙소를 등록하고 관리하세요.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
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
              <p className="text-xs text-gray-500">
                사업자 등록번호를 입력해주세요 (개인사업자 또는 법인사업자)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contact">연락처</Label>
              <Input
                id="contact"
                type="tel"
                placeholder="010-1234-5678"
                {...register('contact')}
                disabled={isLoading}
              />
              {errors.contact && (
                <p className="text-sm text-red-500">{errors.contact.message}</p>
              )}
              <p className="text-xs text-gray-500">
                호스트 활동 시 사용할 연락처를 입력해주세요
              </p>
            </div>

            <div className="p-4 text-sm bg-blue-50 rounded-md">
              <h4 className="font-semibold mb-2">안내사항</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>신청 후 관리자 승인이 필요합니다</li>
                <li>승인까지 1-3일 정도 소요될 수 있습니다</li>
                <li>승인 완료 시 이메일로 안내드립니다</li>
              </ul>
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
