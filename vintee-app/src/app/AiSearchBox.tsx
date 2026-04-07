"use client";

import { useState } from "react";
import Link from "next/link";

interface MatchedTag {
  name: string;
  type: string;
}

interface RecommendResult {
  propertyId: string;
  title: string;
  location: string;
  pricePerNight: number | null;
  thumbnailUrl: string | null;
  score: number;
  matchedTags: MatchedTag[];
  reasoning: string;
}

const SAMPLE_QUERIES = [
  "가족이랑 가을에 조용한 한옥",
  "애견 동반 가능하고 바다 근처 숙소",
  "감귤 따기 체험되는 제주 독채",
  "커플 여행 로맨틱한 산속 오두막",
];

export default function AiSearchBox() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RecommendResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await fetch(`/api/recommend?q=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "추천 엔진 오류");
        setResults([]);
      } else {
        setResults(data.results ?? []);
      }
    } catch {
      setError("네트워크 오류");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    search(query);
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#00A1E0] to-[#16325C] text-white">
            <svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </span>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#00A1E0]">
            AI Contextual Search
          </p>
        </div>

        <h2 className="mt-3 text-2xl font-bold text-[#16325C] md:text-3xl">
          뭘 원하세요? 자연어로 물어보세요
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          GraphRAG 엔진이 숙소 특징·주변 관광지·리뷰 감성을 종합해 맞춤 추천합니다.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="예: 가족이랑 가을에 조용한 한옥, 별 보고 싶어"
              className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]"
            />
            <button
              type="submit"
              disabled={loading || query.trim().length < 2}
              className="rounded-xl bg-[#00A1E0] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0090C7] disabled:opacity-50"
            >
              {loading ? "AI 탐색 중..." : "AI에게 추천받기"}
            </button>
          </div>
        </form>

        {/* 샘플 쿼리 */}
        <div className="mt-4 flex flex-wrap gap-2">
          {SAMPLE_QUERIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                setQuery(q);
                search(q);
              }}
              className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600 hover:border-[#00A1E0] hover:text-[#00A1E0]"
            >
              {q}
            </button>
          ))}
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="mt-8 text-center text-sm text-gray-500">
            GraphRAG 엔진이 숙소를 분석 중입니다…
          </div>
        )}

        {/* 에러 */}
        {error && !loading && (
          <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* 결과 */}
        {searched && !loading && !error && results.length === 0 && (
          <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            매칭되는 숙소를 찾지 못했습니다. 다른 키워드로 시도해보세요.
          </div>
        )}

        {results.length > 0 && !loading && (
          <div className="mt-8 space-y-4">
            <p className="text-xs font-semibold text-gray-500">
              AI가 추천한 숙소 · {results.length}곳
            </p>
            {results.map((r, idx) => (
              <Link
                key={r.propertyId}
                href={`/property/${r.propertyId}`}
                className="group block rounded-2xl border border-gray-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#00A1E0] hover:shadow-lg"
              >
                <div className="flex gap-4">
                  <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-28 sm:w-40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.thumbnailUrl || `https://picsum.photos/seed/${r.propertyId}/320/240`}
                      alt={r.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute left-2 top-2 rounded-full bg-[#16325C] px-2 py-0.5 text-xs font-bold text-white">
                      #{idx + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-[#00A1E0]">
                          {r.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-500">{r.location}</p>
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[#00A1E0] to-[#16325C] px-2.5 py-1 text-xs font-bold text-white">
                        <svg
                          width={12}
                          height={12}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {Math.round(r.score * 100)}%
                      </div>
                    </div>

                    {/* 매칭 태그 */}
                    {r.matchedTags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {r.matchedTags.slice(0, 6).map((t) => (
                          <span
                            key={t.name}
                            className="rounded-full bg-[#F3C969]/20 px-2 py-0.5 text-xs font-medium text-[#16325C]"
                          >
                            #{t.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* AI 추천 이유 */}
                    <div className="mt-2 rounded-lg bg-gray-50 p-2.5 text-xs leading-relaxed text-gray-700">
                      <span className="font-semibold text-[#00A1E0]">AI: </span>
                      {r.reasoning}
                    </div>

                    {r.pricePerNight && (
                      <p className="mt-2 text-sm font-bold text-[#16325C]">
                        {r.pricePerNight.toLocaleString()}원
                        <span className="text-xs font-normal text-gray-400"> / 박</span>
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
