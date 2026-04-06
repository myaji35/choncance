import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-gray-200">404</p>
        <h1 className="mt-4 text-xl font-bold text-[#16325C]">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          요청하신 페이지가 존재하지 않거나 이동되었습니다
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-[#00A1E0] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#0090C7]"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
