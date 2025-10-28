'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
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
  const { isLoaded, userId, isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [existingProfile, setExistingProfile] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HostRequestFormData>({
    resolver: zodResolver(hostRequestSchema),
  });

  // Check if user has existing host profile
  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    // Check if user already has a host profile
    fetch('/api/host/profile')
      .then((res) => {
        if (!res.ok) {
          // 401 or 404 is expected for new users
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.hostProfile) {
          setExistingProfile(data.hostProfile.status);
        }
      })
      .catch((err) => {
        console.error('Failed to check host profile:', err);
      });
  }, [isLoaded, isSignedIn]);

  const onSubmit = async (data: HostRequestFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/host/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessNumber: data.businessNumber,
          contact: data.contact,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.code === 'HOST_PROFILE_EXISTS') {
          setError(`이미 호스트 프로필이 존재합니다 (상태: ${result.status})`);
          setExistingProfile(result.status);
        } else {
          setError(result.error || '호스트 신청에 실패했습니다');
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

  // Show loading while checking authentication and profile
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">로딩 중...</span>
          </div>
          <p className="mt-4 text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  // Show existing profile status
  if (existingProfile) {
    const statusText = existingProfile === 'PENDING'
      ? '승인 대기 중입니다'
      : existingProfile === 'APPROVED'
      ? '이미 승인된 호스트입니다'
      : existingProfile === 'REJECTED'
      ? '호스트 신청이 거부되었습니다'
      : '호스트 프로필이 존재합니다';

    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">호스트 상태</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 text-sm bg-blue-50 rounded-md">
              {statusText}
            </div>
            {existingProfile === 'APPROVED' && (
              <Button
                onClick={() => router.push('/host/dashboard')}
                className="w-full"
              >
                호스트 대시보드로 이동
              </Button>
            )}
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="w-full"
            >
              메인 페이지로 이동
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
