import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { getUser } from "@/lib/supabase/auth-helpers";

export const dynamic = "force-dynamic";

// Max file size: 5MB (UI와 동일하게 통일)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

// Configure Cloudinary if env vars are present
const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .rotate()
      .toBuffer();
  } catch {
    return buffer;
  }
}

async function uploadToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `vintee/${folder}`,
        resource_type: "image",
        format: "webp",
        transformation: [
          { width: 1920, height: 1080, crop: "limit" },
          { quality: "auto:good" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error("Cloudinary upload returned no result"));
        }
      }
    );
    uploadStream.end(buffer);
  });
}

async function saveLocally(buffer: Buffer): Promise<string> {
  const uploadsDir = join(process.cwd(), "public", "uploads");
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  const optimized = await optimizeImage(buffer);
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 10);
  const filename = `${timestamp}-${randomStr}.webp`;
  const filepath = join(uploadsDir, filename);
  await writeFile(filepath, optimized);

  return `/uploads/${filename}`;
}

async function processAndUploadFile(
  file: File,
  folder: string
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (isCloudinaryConfigured) {
    return uploadToCloudinary(buffer, folder);
  }

  // Fallback: optimize and save locally (dev environment)
  return saveLocally(buffer);
}

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `지원하지 않는 파일 형식입니다: ${file.type}`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `파일 크기는 5MB 이하여야 합니다: ${file.name}`;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const authUser = await getUser();
    if (!authUser?.profile?.id) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const folder = (formData.get("folder") as string) || "properties";

    // Support both single "file" and multiple "files" keys
    const singleFile = formData.get("file") as File | null;
    const multipleFiles = formData.getAll("files") as File[];

    const files: File[] = [];
    const hasSingleKey = singleFile && singleFile instanceof File;

    if (hasSingleKey) {
      files.push(singleFile);
    }
    if (multipleFiles.length > 0) {
      for (const f of multipleFiles) {
        if (f instanceof File) {
          files.push(f);
        }
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "파일이 없습니다" },
        { status: 400 }
      );
    }

    // Validate all files
    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        return NextResponse.json(
          { error: validationError },
          { status: 400 }
        );
      }
    }

    // Upload all files
    const uploadedUrls: string[] = [];
    for (const file of files) {
      const url = await processAndUploadFile(file, folder);
      uploadedUrls.push(url);
    }

    // Return both formats for compatibility:
    // - { url, urls } for single file key (ImageUpload component expects data.url)
    // - { urls } for multiple files key (PropertyRegistrationForm expects data.urls)
    if (hasSingleKey && multipleFiles.length === 0) {
      return NextResponse.json({ url: uploadedUrls[0], urls: uploadedUrls });
    }

    return NextResponse.json({ urls: uploadedUrls });
  } catch (error) {
    console.error("파일 업로드 오류:", error);
    return NextResponse.json(
      { error: "파일 업로드에 실패했습니다" },
      { status: 500 }
    );
  }
}
