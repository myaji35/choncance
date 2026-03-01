'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';

/**
 * 전역 에러 페이지
 * 애플리케이션에서 처리되지 않은 에러를 포착
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅
    console.error('Application Error:', error);

    // TODO: 외부 에러 추적 서비스로 전송 (Sentry, LogRocket 등)
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* 에러 아이콘 */}
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 rounded-full p-4">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* 에러 제목 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          앗! 문제가 발생했습니다
        </h1>

        {/* 에러 설명 */}
        <p className="text-gray-600 mb-2">
          예상치 못한 오류가 발생했습니다.
        </p>

        {/* 개발 환경에서만 에러 메시지 표시 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-red-800 mb-2">개발 모드 에러 정보:</p>
            <p className="text-xs text-red-700 font-mono break-words">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-600 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <p className="text-sm text-gray-500 mb-6">
          잠시 후 다시 시도해주시거나, 문제가 지속되면 고객센터로 문의해주세요.
        </p>

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2"
            variant="default"
          >
            <RefreshCw className="w-4 h-4" />
            다시 시도
          </Button>

          <Link href="/" className="flex-1">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              홈으로 이동
            </Button>
          </Link>
        </div>

        {/* 도움말 링크 */}
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
