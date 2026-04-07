// OpenAI 클라이언트 싱글톤 + 임베딩 유틸

import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const EMBEDDING_MODEL = "text-embedding-3-small"; // 1536 dim, 가장 저렴
export const CHAT_MODEL = "gpt-4o-mini"; // 태그 추출/재순위

/** 텍스트 → 임베딩 벡터 (Float32Array) */
export async function embedText(text: string): Promise<Float32Array> {
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return Float32Array.from(res.data[0].embedding);
}

/** Float32Array → Uint8Array<ArrayBuffer> (Prisma 7 Bytes 저장용) */
export function floatsToBytes(arr: Float32Array): Uint8Array<ArrayBuffer> {
  const ab = new ArrayBuffer(arr.length * 4);
  new Float32Array(ab).set(arr);
  return new Uint8Array(ab) as Uint8Array<ArrayBuffer>;
}

/** Uint8Array → Float32Array */
export function bytesToFloats(bytes: Uint8Array): Float32Array {
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);
  return new Float32Array(ab);
}

/** 코사인 유사도 */
export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
