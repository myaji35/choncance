'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

/**
 * 루트 레벨 전역 에러 페이지
 * error.tsx에서도 잡히지 않은 최상위 에러를 처리
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              심각한 오류가 발생했습니다
            </h1>

            <p className="text-gray-600 mb-6">
              애플리케이션에 심각한 문제가 발생했습니다.
              <br />
              페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 text-left">
                <p className="text-sm font-semibold text-red-800 mb-2">
                  개발 모드 에러 정보:
                </p>
                <p className="text-xs text-red-700 font-mono break-words">
                  {error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button onClick={reset} variant="default" className="w-full">
                다시 시도
              </Button>

              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full"
              >
                홈으로 이동
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
