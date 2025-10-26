'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Zod validation schema
const profileSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다').max(50, '이름은 50자 이하여야 합니다'),
  phone: z.string().regex(/^\d{3}-\d{4}-\d{4}$/, '전화번호 형식: 010-1234-5678'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  profile_image: string | null;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/v1/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          router.push('/login');
          return;
        }
        throw new Error('프로필을 불러오는데 실패했습니다');
      }

      const data = await response.json();
      setProfile(data);
      setValue('name', data.name);
      setValue('phone', data.phone);
    } catch (err) {
      setError('프로필을 불러오는데 실패했습니다');
      console.error(err);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch('http://localhost:8000/api/v1/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.detail?.message || '프로필 업데이트에 실패했습니다');
        return;
      }

      const result = await response.json();
      setProfile(result);
      setSuccess('프로필이 성공적으로 업데이트되었습니다');
    } catch (err) {
      setError('서버 연결에 실패했습니다');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setError(null);

    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/v1/user/profile/upload-photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.detail?.message || '사진 업로드에 실패했습니다');
        return;
      }

      const result = await response.json();
      setProfile((prev) => prev ? { ...prev, profile_image: result.profile_image } : null);
      setSuccess('프로필 사진이 업데이트되었습니다');
    } catch (err) {
      setError('서버 연결에 실패했습니다');
      console.error(err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (!profile) {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">프로필 관리</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Profile Photo */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.profile_image ? `http://localhost:8000${profile.profile_image}` : undefined} />
              <AvatarFallback>{profile.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                className="hidden"
                id="photo-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('photo-upload')?.click()}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? '업로드 중...' : '사진 변경'}
              </Button>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="p-3 text-sm text-green-700 bg-green-50 rounded-md">
              {success}
            </div>
          )}
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email (Read-only) */}
            <div className="grid gap-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500">이메일은 변경할 수 없습니다</p>
            </div>

            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                type="text"
                {...register('name')}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Phone */}
            <div className="grid gap-2">
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="010-1234-5678"
                {...register('phone')}
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {/* Created At */}
            <div className="grid gap-2">
              <Label>가입 일자</Label>
              <Input
                type="text"
                value={new Date(profile.created_at).toLocaleDateString('ko-KR')}
                disabled
                className="bg-gray-100"
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '저장 중...' : '저장'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
