"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft } from 'lucide-react';

/**
 * 404 Not Found 페이지
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* 404 일러스트 */}
        <div className="mb-6">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
        </div>

        {/* 제목 */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          페이지를 찾을 수 없습니다
        </h2>

        {/* 설명 */}
        <p className="text-gray-600 mb-6">
          요청하신 페이지가 존재하지 않거나 이동했습니다.
          <br />
          주소를 다시 확인해주세요.
        </p>

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            이전 페이지
          </Button>

          <Link href="/" className="flex-1">
            <Button className="w-full flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              홈으로 이동
            </Button>
          </Link>
        </div>

        {/* 추천 링크 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            다른 페이지를 찾으시나요?
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/explore">
              <Button
                variant="ghost"
                className="w-full flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                숙소 탐색하기
              </Button>
            </Link>

            {/* 로그인한 사용자만 보이는 링크들 */}
            <Link href="/bookings">
              <Button
                variant="ghost"
                className="w-full text-sm text-gray-600 hover:text-gray-900"
              >
                내 예약 보기
              </Button>
            </Link>
          </div>
        </div>

        {/* 고객센터 링크 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            도움이 필요하신가요?{' '}
            <Link href="/help" className="text-blue-600 hover:underline">
              고객센터
            </Link>
            로 문의해주세요
          </p>
        </div>
      </div>
    </div>
  );
}
