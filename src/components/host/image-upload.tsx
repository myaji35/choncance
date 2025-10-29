"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  label?: string;
  folder?: string; // GCS folder (e.g., 'properties', 'experiences')
}

export function ImageUpload({
  value,
  onChange,
  maxImages = 10,
  label = "이미지",
  folder = "properties",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      // Check file type
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name}은(는) 이미지 파일이 아닙니다`);
        return;
      }

      // Check file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name}은(는) 5MB를 초과합니다`);
        return;
      }

      valid.push(file);
    });

    return { valid, errors };
  };

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;

    // Check max images
    if (value.length + files.length > maxImages) {
      setError(`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다`);
      return;
    }

    // Validate files
    const { valid, errors } = validateFiles(files);

    if (errors.length > 0) {
      setError(errors.join(", "));
      return;
    }

    if (valid.length === 0) return;

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const uploadedUrls: string[] = [];

      // Upload files one by one to show progress
      for (let i = 0; i < valid.length; i++) {
        const file = valid[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "업로드 실패");
        }

        const data = await response.json();
        uploadedUrls.push(data.url);

        // Update progress
        setUploadProgress(Math.round(((i + 1) / valid.length) * 100));
      }

      onChange([...value, ...uploadedUrls]);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "이미지 업로드에 실패했습니다");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await uploadFiles(files);
  };

  const handleRemove = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
    // TODO: Delete from Cloud Storage if needed
  };

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files);
        await uploadFiles(files);
      }
    },
    [value, maxImages, folder]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-sm text-gray-500">
          {value.length} / {maxImages}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            업로드 중... {uploadProgress}%
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden border"
            >
              <Image
                src={url}
                alt={`Upload ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={uploading}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded text-xs font-medium">
                  대표
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {value.length < maxImages && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload-input"
          />

          {/* Drag and Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${dragActive ? "border-primary bg-primary/5" : "border-gray-300"}
              ${uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <Upload
              className={`w-12 h-12 mx-auto mb-4 ${
                dragActive ? "text-primary" : "text-gray-400"
              }`}
            />
            <p className="text-sm font-medium text-gray-700 mb-1">
              {dragActive
                ? "여기에 이미지를 놓으세요"
                : "클릭하거나 이미지를 드래그하세요"}
            </p>
            <p className="text-xs text-gray-500">
              JPG, PNG, WEBP, GIF (최대 5MB)
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full mt-3"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                업로드 중...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                이미지 선택
              </>
            )}
          </Button>

          <p className="text-sm text-gray-500 mt-2">
            첫 번째 이미지가 대표 이미지로 설정됩니다.
          </p>
        </div>
      )}
    </div>
  );
}
