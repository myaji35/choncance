"use client";

import { useState } from "react";

interface HostResponseFormProps {
  reviewId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function HostResponseForm({
  reviewId,
  onSuccess,
  onCancel,
}: HostResponseFormProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.length < 10) {
      setError("최소 10자 이상 입력해주세요");
      return;
    }
    if (content.length > 300) {
      setError("최대 300자까지 입력 가능합니다");
      return;
    }

    setSubmitting(true);
    setError("");

    const res = await fetch(`/api/reviews/${reviewId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "답글 등록에 실패했습니다");
      setSubmitting(false);
      return;
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="게스트에게 감사의 답글을 남겨보세요 (10-300자)"
        rows={3}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{content.length}/300</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-[#00A1E0] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#0090C7] disabled:opacity-50"
          >
            {submitting ? "등록 중..." : "답글 등록"}
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  );
}
