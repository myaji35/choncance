import { Storage } from "@google-cloud/storage";

// GCP 프로젝트 설정
const projectId = process.env.GCP_PROJECT_ID || "choncance";
const bucketName = process.env.GCP_STORAGE_BUCKET || "choncance-images";

// Storage 클라이언트 초기화
let storage: Storage;

try {
  // Production: GCP에서 자동으로 인증 처리
  // Development: GOOGLE_APPLICATION_CREDENTIALS 환경 변수로 서비스 계정 키 경로 지정
  storage = new Storage({
    projectId,
  });
} catch (error) {
  console.error("Failed to initialize Google Cloud Storage:", error);
  throw error;
}

/**
 * 이미지를 Cloud Storage에 업로드
 * @param file File 또는 Buffer
 * @param folder 저장할 폴더 (예: 'properties', 'experiences')
 * @param fileName 파일명 (확장자 포함)
 * @returns 업로드된 파일의 공개 URL
 */
export async function uploadImage(
  file: Buffer,
  folder: string,
  fileName: string
): Promise<string> {
  try {
    const bucket = storage.bucket(bucketName);

    // 파일명에 타임스탬프 추가하여 중복 방지
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const destination = `${folder}/${timestamp}-${sanitizedFileName}`;

    const fileUpload = bucket.file(destination);

    await fileUpload.save(file, {
      metadata: {
        contentType: getContentType(fileName),
        cacheControl: "public, max-age=31536000", // 1 year
      },
      public: true, // 파일을 공개로 설정
    });

    // 공개 URL 반환
    return `https://storage.googleapis.com/${bucketName}/${destination}`;
  } catch (error) {
    console.error("Error uploading to Cloud Storage:", error);
    throw new Error("Failed to upload image");
  }
}

/**
 * 여러 이미지를 한번에 업로드
 * @param files Buffer 배열
 * @param folder 저장할 폴더
 * @param fileNames 파일명 배열
 * @returns 업로드된 파일들의 공개 URL 배열
 */
export async function uploadImages(
  files: Buffer[],
  folder: string,
  fileNames: string[]
): Promise<string[]> {
  if (files.length !== fileNames.length) {
    throw new Error("Files and fileNames arrays must have the same length");
  }

  const uploadPromises = files.map((file, index) =>
    uploadImage(file, folder, fileNames[index])
  );

  return Promise.all(uploadPromises);
}

/**
 * Cloud Storage에서 이미지 삭제
 * @param url 이미지의 공개 URL
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    // URL에서 파일 경로 추출
    // 예: https://storage.googleapis.com/choncance-images/properties/123-image.jpg
    const urlParts = url.split(`${bucketName}/`);
    if (urlParts.length !== 2) {
      throw new Error("Invalid image URL");
    }

    const filePath = urlParts[1];
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);

    await file.delete();
  } catch (error) {
    console.error("Error deleting from Cloud Storage:", error);
    throw new Error("Failed to delete image");
  }
}

/**
 * 여러 이미지를 한번에 삭제
 * @param urls 이미지 URL 배열
 */
export async function deleteImages(urls: string[]): Promise<void> {
  const deletePromises = urls.map((url) => deleteImage(url));
  await Promise.all(deletePromises);
}

/**
 * 파일 확장자로 Content-Type 결정
 * @param fileName 파일명
 * @returns Content-Type
 */
function getContentType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();

  const contentTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
  };

  return contentTypes[ext || ""] || "application/octet-stream";
}

/**
 * 이미지 파일인지 검증
 * @param fileName 파일명
 * @returns boolean
 */
export function isValidImageFile(fileName: string): boolean {
  const validExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
  const ext = fileName.split(".").pop()?.toLowerCase();
  return ext ? validExtensions.includes(ext) : false;
}

/**
 * 파일 크기 검증 (최대 5MB)
 * @param fileSize 파일 크기 (bytes)
 * @returns boolean
 */
export function isValidFileSize(fileSize: number): boolean {
  const maxSize = 5 * 1024 * 1024; // 5MB
  return fileSize <= maxSize;
}
