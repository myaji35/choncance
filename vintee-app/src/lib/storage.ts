// ISS-024: 이미지 업로드 어댑터
// BLOB_READ_WRITE_TOKEN 환경변수가 있으면 Vercel Blob 사용,
// 없으면 public/uploads/ 로컬 디스크 fallback (개발/테스트)

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export interface UploadResult {
  url: string;
  size: number;
}

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

function safeFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, "");
  const hash = crypto.randomBytes(8).toString("hex");
  return `${Date.now()}-${hash}${ext}`;
}

export function validateImage(file: File): { ok: true } | { ok: false; error: string } {
  if (!ALLOWED_TYPES.has(file.type)) {
    return { ok: false, error: "JPG/PNG/WebP/AVIF 형식만 업로드 가능합니다" };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "이미지는 5MB 이하만 업로드 가능합니다" };
  }
  if (file.size === 0) {
    return { ok: false, error: "빈 파일입니다" };
  }
  return { ok: true };
}

export async function uploadImage(file: File, prefix = "properties"): Promise<UploadResult> {
  const valid = validateImage(file);
  if (!valid.ok) throw new Error(valid.error);

  const filename = safeFilename(file.name);
  const key = `${prefix}/${filename}`;
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (token) {
    // Vercel Blob HTTP API
    const res = await fetch(`https://blob.vercel-storage.com/${key}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": file.type,
        "x-api-version": "7",
      },
      body: file.stream() as unknown as BodyInit,
      // @ts-expect-error — Node fetch streaming body
      duplex: "half",
    });
    if (!res.ok) {
      throw new Error(`Vercel Blob upload failed: ${res.status}`);
    }
    const data = (await res.json()) as { url: string };
    return { url: data.url, size: file.size };
  }

  // Dev fallback: public/uploads/ 디스크 저장
  const uploadDir = path.join(process.cwd(), "public", "uploads", prefix);
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);
  return {
    url: `/uploads/${prefix}/${filename}`,
    size: file.size,
  };
}
