import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { uploadImage, uploadImages, isValidImageFile, isValidFileSize } from "@/lib/storage";

/**
 * POST /api/upload
 * 이미지 업로드 API
 *
 * Form Data:
 * - file: File (단일 파일) 또는 files: File[] (다중 파일)
 * - folder: string (저장할 폴더, 기본값: 'uploads')
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // FormData 파싱
    const formData = await request.formData();
    const folder = (formData.get("folder") as string) || "uploads";

    // 단일 파일 업로드
    const file = formData.get("file") as File | null;
    if (file) {
      return await handleSingleUpload(file, folder);
    }

    // 다중 파일 업로드
    const files = formData.getAll("files") as File[];
    if (files.length > 0) {
      return await handleMultipleUpload(files, folder);
    }

    return NextResponse.json(
      { error: "No file(s) provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleSingleUpload(file: File, folder: string) {
  try {
    // 파일 검증
    if (!isValidImageFile(file.name)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 }
      );
    }

    if (!isValidFileSize(file.size)) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // File을 Buffer로 변환
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Cloud Storage에 업로드
    const url = await uploadImage(buffer, folder, file.name);

    return NextResponse.json({
      success: true,
      url,
      fileName: file.name,
    });
  } catch (error) {
    console.error("Single upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

async function handleMultipleUpload(files: File[], folder: string) {
  try {
    // 최대 10개 파일 제한
    if (files.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 files can be uploaded at once" },
        { status: 400 }
      );
    }

    // 모든 파일 검증
    for (const file of files) {
      if (!isValidImageFile(file.name)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.name}. Only images are allowed.` },
          { status: 400 }
        );
      }

      if (!isValidFileSize(file.size)) {
        return NextResponse.json(
          { error: `File size exceeds 5MB limit: ${file.name}` },
          { status: 400 }
        );
      }
    }

    // 모든 파일을 Buffer로 변환
    const buffers = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer();
        return Buffer.from(bytes);
      })
    );

    const fileNames = files.map((file) => file.name);

    // Cloud Storage에 업로드
    const urls = await uploadImages(buffers, folder, fileNames);

    return NextResponse.json({
      success: true,
      urls,
      fileNames,
    });
  } catch (error) {
    console.error("Multiple upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload images" },
      { status: 500 }
    );
  }
}
