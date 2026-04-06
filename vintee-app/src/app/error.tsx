"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="mt-4 text-xl font-bold text-[#16325C]">문제가 발생했습니다</h1>
        <p className="mt-2 text-sm text-gray-500">
          {error.message || "페이지를 로드하는 중 오류가 발생했습니다"}
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-[#00A1E0] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#0090C7]"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
