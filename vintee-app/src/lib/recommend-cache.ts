// ISS-021: AI 추천 응답 캐시
// 정규화 쿼리 → 결과 5분 TTL. 운영 시 Redis/KV로 교체

import type { RecommendResult } from "./graph-rag/recommend";

interface CacheEntry {
  data: RecommendResult[];
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const TTL_MS = 5 * 60 * 1000; // 5분
const MAX_ENTRIES = 500;

function normalize(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

export function getRecommendCache(query: string): RecommendResult[] | null {
  const key = normalize(query);
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

export function setRecommendCache(query: string, data: RecommendResult[]): void {
  const key = normalize(query);
  // LRU-ish: 크기 제한 시 가장 오래된 entry 제거
  if (cache.size >= MAX_ENTRIES) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { data, expiresAt: Date.now() + TTL_MS });
}
