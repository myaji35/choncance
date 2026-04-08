"use client";

// ISS-027: 5단계 마법사 — 60대 호스트도 부담 없이 등록
// 한 화면 = 한 가지 결정. 진행률 표시 + 이전/다음 버튼.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import GeoFieldsSection, {
  emptyGeoFields,
  geoFieldsToPayload,
  type GeoFieldsValue,
} from "@/components/host/GeoFieldsSection";
import ImageUpload, { type VisionTagSuggestion } from "@/components/host/ImageUpload";

const STEPS = [
  { key: "photos", title: "사진", subtitle: "한 장만 있어도 충분해요" },
  { key: "basics", title: "기본 정보", subtitle: "이름과 소개" },
  { key: "location", title: "위치", subtitle: "지역과 주소" },
  { key: "pricing", title: "가격과 인원", subtitle: "1박 가격, 최대 인원" },
  { key: "story", title: "호스트 한마디", subtitle: "GEO 점수와 AI 추천에 영향 (선택)" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

export default function NewPropertyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoSuggestion, setSeoSuggestion] = useState<{
    title: string;
    description: string;
    highlights: string[];
    changeNotes: string[];
  } | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    address: "",
    pricePerNight: "",
    maxGuests: "4",
    phone: "",
    status: "active" as "draft" | "active",
  });
  const [images, setImages] = useState<string[]>([]);
  const [geo, setGeo] = useState<GeoFieldsValue>(emptyGeoFields);

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ISS-037: AI 다듬기
  const requestSeoSuggest = async () => {
    if (!form.title.trim() && !form.description.trim()) {
      setError("제목 또는 소개를 먼저 적어주세요");
      return;
    }
    setSeoLoading(true);
    setSeoSuggestion(null);
    setError("");
    try {
      const res = await fetch("/api/host/seo-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          location: form.location,
          highlights: geo.highlights,
          hostIntro: geo.hostIntro,
          uniqueExperience: geo.uniqueExperience,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "AI 다듬기에 실패했어요");
        return;
      }
      setSeoSuggestion(data.suggestion);
    } catch {
      setError("네트워크 오류");
    } finally {
      setSeoLoading(false);
    }
  };

  const acceptSeoSuggestion = () => {
    if (!seoSuggestion) return;
    setForm((prev) => ({
      ...prev,
      title: seoSuggestion.title,
      description: seoSuggestion.description,
    }));
    setGeo((prev) => ({
      ...prev,
      highlights: seoSuggestion.highlights.length > 0 ? seoSuggestion.highlights : prev.highlights,
    }));
    setSeoSuggestion(null);
    toast("AI 제안을 적용했어요");
  };

  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;
  const currentStep = STEPS[step];

  // 단계별 다음 진행 가능 여부
  const canProceed = (key: StepKey): boolean => {
    if (key === "basics") return form.title.trim().length >= 2;
    if (key === "location") return form.location.trim().length >= 2;
    return true; // 사진/가격/스토리는 모두 선택 (나중에 추가 가능)
  };

  const next = () => {
    if (!canProceed(currentStep.key)) {
      setError(
        currentStep.key === "basics"
          ? "숙소 이름을 적어주세요"
          : "지역을 적어주세요"
      );
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const prev = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    if (!canProceed("basics") || !canProceed("location")) {
      setError("숙소 이름과 지역은 꼭 필요해요");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        pricePerNight: form.pricePerNight ? Number(form.pricePerNight) : undefined,
        maxGuests: Number(form.maxGuests),
        images,
        thumbnailUrl: images[0] ?? undefined,
        ...geoFieldsToPayload(geo),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "등록에 실패했습니다");
      setLoading(false);
      return;
    }

    toast("숙소가 등록되었습니다!");
    router.push("/host");
    router.refresh();
  };

  return (
    <div className="bg-[#F5F1E8] py-8">
    <div className="mx-auto max-w-xl px-4">
      <h1 className="text-2xl font-bold text-[#1F2937]">숙소 등록</h1>
      <p className="mt-1 text-sm text-gray-600">
        한 단계씩 천천히 진행하세요. 나중에 언제든 수정할 수 있어요.
      </p>

      {/* 진행률 바 */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs font-semibold text-[#4A6741]">
          <span>{step + 1} / {STEPS.length} 단계</span>
          <span>{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-[#4A6741] transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <div className="mt-3">
          <p className="text-lg font-bold text-[#1F2937]">{currentStep.title}</p>
          <p className="text-xs text-gray-500">{currentStep.subtitle}</p>
        </div>
      </div>

      {/* 단계 컨텐츠 */}
      <div className="mt-6 rounded-2xl border border-[#4A6741]/15 bg-white p-5 md:p-6">
        {currentStep.key === "photos" && (
          <div>
            <ImageUpload
              value={images}
              onChange={setImages}
              onSuggestedTags={(tags: VisionTagSuggestion[]) => {
                // ISS-039: 사진에서 추출된 태그를 GEO highlights에 자동 머지
                setGeo((prev) => {
                  const next = new Set([...prev.highlights, ...tags.map((t) => t.name)]);
                  return { ...prev, highlights: Array.from(next).slice(0, 10) };
                });
              }}
            />
            <p className="mt-3 text-xs text-gray-500">
              사진이 없어도 다음으로 넘어갈 수 있어요. 등록 후 언제든 추가 가능합니다.
            </p>
          </div>
        )}

        {currentStep.key === "basics" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                숙소 이름 *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#4A6741] focus:outline-none focus:ring-1 focus:ring-[#4A6741]"
                placeholder="예: 논뷰 한옥 펜션"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                숙소 소개
              </label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#4A6741] focus:outline-none focus:ring-1 focus:ring-[#4A6741]"
                placeholder="조용한 시골 마을, 아침에 새소리로 깨는 곳입니다..."
              />
              <p className="mt-1 text-xs text-gray-400">
                200자 이상 적으면 GEO 점수가 올라가요
              </p>
            </div>

            {/* ISS-037: AI 다듬기 */}
            <button
              type="button"
              onClick={requestSeoSuggest}
              disabled={seoLoading || (!form.title.trim() && !form.description.trim())}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#4A6741] bg-white px-4 py-2.5 text-sm font-bold text-[#4A6741] transition hover:bg-[#4A6741] hover:text-white disabled:opacity-50"
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              {seoLoading ? "AI가 다듬는 중..." : "VINTEE AI로 다듬기 (선택)"}
            </button>

            {seoSuggestion && (
              <div className="rounded-2xl border-2 border-[#D97B3F]/40 bg-[#F5F1E8] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#D97B3F]">
                    AI 제안
                  </p>
                  <button
                    type="button"
                    onClick={() => setSeoSuggestion(null)}
                    className="text-xs text-gray-500 hover:text-gray-800"
                  >
                    닫기
                  </button>
                </div>
                <div className="mt-3 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-600">제안 제목</p>
                    <p className="mt-1 rounded-lg bg-white px-3 py-2 text-sm font-bold text-[#1F2937]">
                      {seoSuggestion.title}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">제안 소개</p>
                    <p className="mt-1 rounded-lg bg-white px-3 py-2 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                      {seoSuggestion.description}
                    </p>
                  </div>
                  {seoSuggestion.highlights.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600">제안 하이라이트</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {seoSuggestion.highlights.map((h) => (
                          <span
                            key={h}
                            className="rounded-full bg-[#4A6741] px-2.5 py-0.5 text-xs font-medium text-white"
                          >
                            #{h}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {seoSuggestion.changeNotes.length > 0 && (
                    <ul className="ml-4 list-disc space-y-1 text-xs text-gray-600">
                      {seoSuggestion.changeNotes.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  type="button"
                  onClick={acceptSeoSuggestion}
                  className="mt-4 w-full rounded-xl bg-[#D97B3F] py-2.5 text-sm font-bold text-white hover:bg-[#C26A30]"
                >
                  이 제안 적용하기 →
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep.key === "location" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                지역 *
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#4A6741] focus:outline-none focus:ring-1 focus:ring-[#4A6741]"
                placeholder="예: 충남 아산"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                상세 주소
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#4A6741] focus:outline-none focus:ring-1 focus:ring-[#4A6741]"
                placeholder="(선택) 정확한 주소"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                연락처
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#4A6741] focus:outline-none focus:ring-1 focus:ring-[#4A6741]"
                placeholder="010-0000-0000"
              />
            </div>
          </div>
        )}

        {currentStep.key === "pricing" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                1박 가격
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={form.pricePerNight}
                  onChange={(e) => update("pricePerNight", e.target.value)}
                  min={0}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#4A6741] focus:outline-none focus:ring-1 focus:ring-[#4A6741]"
                  placeholder="120000"
                />
                <span className="text-sm text-gray-500">원 / 박</span>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                지금 비워두고 나중에 정해도 돼요
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                최대 수용 인원
              </label>
              <input
                type="number"
                value={form.maxGuests}
                onChange={(e) => update("maxGuests", e.target.value)}
                min={1}
                max={20}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-[#4A6741] focus:outline-none focus:ring-1 focus:ring-[#4A6741]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                공개 상태
              </label>
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-[#4A6741] focus:outline-none focus:ring-1 focus:ring-[#4A6741]"
              >
                <option value="active">바로 공개 — 사람들이 찾을 수 있어요</option>
                <option value="draft">임시 저장 — 나만 보이게</option>
              </select>
            </div>
          </div>
        )}

        {currentStep.key === "story" && (
          <div>
            <p className="mb-3 text-xs text-gray-600">
              이 단계는 모두 선택입니다. 적을수록 AI 추천에 더 잘 노출돼요.
              지금 건너뛰고 나중에 채워도 괜찮아요.
            </p>
            <GeoFieldsSection value={geo} onChange={setGeo} />
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </p>
        )}
      </div>

      {/* 네비게이션 */}
      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={isFirst ? () => router.back() : prev}
          className="flex-1 rounded-xl border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          {isFirst ? "취소" : "← 이전"}
        </button>
        {isLast ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 rounded-xl bg-[#D97B3F] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#C26A30] disabled:opacity-50"
          >
            {loading ? "등록 중..." : "등록 완료 →"}
          </button>
        ) : (
          <button
            type="button"
            onClick={next}
            className="flex-1 rounded-xl bg-[#4A6741] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#3a5234]"
          >
            다음 →
          </button>
        )}
      </div>

      {/* Step indicator dots */}
      <div className="mt-5 flex justify-center gap-2">
        {STEPS.map((s, idx) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setStep(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === step
                ? "w-8 bg-[#4A6741]"
                : idx < step
                ? "w-2 bg-[#4A6741]/60"
                : "w-2 bg-gray-300"
            }`}
            aria-label={`${idx + 1}단계로 이동`}
          />
        ))}
      </div>
    </div>
    </div>
  );
}
