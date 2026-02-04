import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { optimizeImageWithAI } from "@/lib/image-optimizer";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "파일이 없습니다" },
        { status: 400 }
      );
    }

    // Validate file types
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `지원하지 않는 파일 형식입니다: ${file.type}` },
          { status: 400 }
        );
      }
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Optimize image with Gemini AI
      console.log(`[Upload API] Processing: ${file.name}`);
      const optimized = await optimizeImageWithAI(buffer, file.name);

      // Generate unique filename with optimized format
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const filename = `${timestamp}-${randomString}.${optimized.format}`;

      // Save optimized file
      const filepath = join(uploadsDir, filename);
      await writeFile(filepath, optimized.buffer);

      console.log(`[Upload API] Saved: ${filename} (${optimized.width}x${optimized.height})`);

      // Return public URL
      uploadedUrls.push(`/uploads/${filename}`);
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
