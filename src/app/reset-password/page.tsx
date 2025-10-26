'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다')
    .regex(/[A-Za-z]/, '비밀번호는 영문을 포함해야 합니다')
    .regex(/\d/, '비밀번호는 숫자를 포함해야 합니다'),
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['passwordConfirm'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      setError('유효하지 않은 재설정 링크입니다');
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('유효하지 않은 재설정 링크입니다');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          new_password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.detail?.code === 'INVALID_TOKEN') {
          setError('재설정 링크가 만료되었거나 유효하지 않습니다');
        } else {
          setError(result.detail?.message || '비밀번호 재설정에 실패했습니다');
        }
        return;
      }

      alert('비밀번호가 성공적으로 변경되었습니다!');
      router.push('/login');
    } catch (err) {
      setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
      console.error('Reset password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">새 비밀번호 설정</CardTitle>
          <CardDescription className="text-center">
            새로운 비밀번호를 입력해주세요.
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
              <Label htmlFor="password">새 비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="영문, 숫자 포함 8자 이상"
                {...register('password')}
                disabled={isLoading || !token}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
              <Input
                id="passwordConfirm"
                type="password"
                {...register('passwordConfirm')}
                disabled={isLoading || !token}
              />
              {errors.passwordConfirm && (
                <p className="text-sm text-red-500">{errors.passwordConfirm.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !token}>
              {isLoading ? '변경 중...' : '비밀번호 변경'}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
