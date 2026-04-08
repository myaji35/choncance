"use client";

// ISS-024: 호스트용 다중 이미지 업로드 컴포넌트
// brand voice: 정겨움 + 친절한 안내
// 클릭 또는 drag&drop, 첫 번째가 자동 thumbnail

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";

// ISS-039: Vision 태깅 결과 타입
export interface VisionTagSuggestion {
  slug: string;
  name: string;
  type: string;
}

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  onSuggestedTags?: (tags: VisionTagSuggestion[]) => void;
  max?: number;
}

export default function ImageUpload({
  value,
  onChange,
  onSuggestedTags,
  max = 10,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [lastSuggestedTags, setLastSuggestedTags] = useState<VisionTagSuggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    if (value.length + files.length > max) {
      setError(`사진은 최대 ${max}장까지 등록할 수 있어요`);
      return;
    }
    setUploading(true);
    const uploaded: string[] = [];
    const allSuggestedTags: VisionTagSuggestion[] = [];
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "업로드 실패");
        uploaded.push(data.url);
        if (Array.isArray(data.suggestedTags)) {
          for (const t of data.suggestedTags as VisionTagSuggestion[]) {
            if (!allSuggestedTags.some((existing) => existing.slug === t.slug)) {
              allSuggestedTags.push(t);
            }
          }
        }
      }
      onChange([...value, ...uploaded]);
      if (allSuggestedTags.length > 0) {
        setLastSuggestedTags(allSuggestedTags);
        onSuggestedTags?.(allSuggestedTags);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 중 문제가 생겼어요");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeAt = (idx: number) => {
    const next = value.filter((_, i) => i !== idx);
    onChange(next);
  };

  const moveToFirst = (idx: number) => {
    if (idx === 0) return;
    const next = [value[idx], ...value.filter((_, i) => i !== idx)];
    onChange(next);
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        숙소 사진 ({value.length}/{max})
      </label>

      {/* 미리보기 그리드 */}
      {value.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((url, idx) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`사진 ${idx + 1}`} className="h-full w-full object-cover" />
              {idx === 0 ? (
                <span className="absolute left-1 top-1 rounded-full bg-[#4A6741] px-2 py-0.5 text-[10px] font-bold text-white">
                  대표
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => moveToFirst(idx)}
                  className="absolute left-1 top-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-[#4A6741] opacity-0 transition group-hover:opacity-100"
                >
                  대표로
                </button>
              )}
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition hover:bg-black group-hover:opacity-100"
                aria-label="삭제"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 업로드 영역 */}
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition ${
          dragOver
            ? "border-[#4A6741] bg-[#F5F1E8]"
            : "border-gray-300 bg-gray-50 hover:border-[#4A6741] hover:bg-[#F5F1E8]"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files)}
          className="hidden"
        />
        <svg
          width={36}
          height={36}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4A6741"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        <p className="mt-2 text-sm font-semibold text-[#1F2937]">
          {uploading ? "올리는 중..." : "사진을 클릭하거나 드래그해서 올려주세요"}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          JPG/PNG/WebP · 한 장 5MB 이하 · 첫 번째가 대표 사진이 돼요
        </p>
      </label>

      {/* ISS-039: Vision 자동 태그 제안 */}
      {lastSuggestedTags.length > 0 && (
        <div className="mt-3 rounded-lg border border-[#4A6741]/20 bg-[#F5F1E8] p-3">
          <p className="text-xs font-semibold text-[#4A6741]">
            VINTEE AI가 사진에서 발견한 태그
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {lastSuggestedTags.map((t) => (
              <span
                key={t.slug}
                className="rounded-full bg-[#4A6741] px-2.5 py-0.5 text-xs font-medium text-white"
              >
                #{t.name}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-gray-500">
            마지막 단계에서 자동으로 하이라이트에 추가돼요. 원치 않으면 이 단계 후 수정 가능.
          </p>
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
