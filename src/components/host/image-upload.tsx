"use client";

import { useState, useRef, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Loader2, GripVertical } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  minImages?: number;
  label?: string;
  folder?: string;
}

interface SortableImageItemProps {
  url: string;
  index: number;
  onRemove: (index: number) => void;
  uploading: boolean;
}

function SortableImageItem({ url, index, onRemove, uploading }: SortableImageItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative aspect-square rounded-lg overflow-hidden border bg-white"
    >
      <Image
        src={url}
        alt={`Upload ${index + 1}`}
        fill
        className="object-cover"
      />
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute bottom-2 left-2 bg-black/40 text-white rounded p-1 cursor-grab active:cursor-grabbing hover:bg-black/60 transition-colors"
        aria-label="드래그하여 순서 변경"
      >
        <GripVertical className="w-3 h-3" />
      </button>
      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(index)}
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
  );
}

export function ImageUpload({
  value,
  onChange,
  maxImages = 10,
  minImages = 0,
  label = "이미지",
  folder = "properties",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = value.indexOf(active.id as string);
      const newIndex = value.indexOf(over.id as string);
      onChange(arrayMove(value, oldIndex, newIndex));
    }
  };

  const validateFiles = (files: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name}은(는) 이미지 파일이 아닙니다`);
        return;
      }
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

    if (value.length + files.length > maxImages) {
      setError(`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다`);
      return;
    }

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
          const errData = await response.json();
          throw new Error(errData.error || "업로드 실패");
        }

        const data = await response.json();
        uploadedUrls.push(data.url);
        setUploadProgress(Math.round(((i + 1) / valid.length) * 100));
      }

      onChange([...value, ...uploadedUrls]);
    } catch (err: unknown) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "이미지 업로드에 실패했습니다");
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
    onChange(value.filter((_, i) => i !== index));
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleFileDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        await uploadFiles(Array.from(e.dataTransfer.files));
      }
    },
    [value, maxImages, folder] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>
          {label}
          {minImages > 0 && (
            <span className="ml-1 text-xs text-gray-500">(최소 {minImages}장)</span>
          )}
        </Label>
        <span
          className={`text-sm ${
            minImages > 0 && value.length < minImages
              ? "text-red-500 font-medium"
              : "text-gray-500"
          }`}
        >
          {value.length} / {maxImages}
          {minImages > 0 && value.length < minImages &&
            ` (${minImages - value.length}장 더 필요)`}
        </span>
      </div>

      {minImages > 0 && value.length < minImages && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-sm text-amber-800">
          숙소 이미지를 최소 {minImages}장 이상 업로드해주세요. (현재 {value.length}장)
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
      )}

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            업로드 중... {uploadProgress}%
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {/* Sortable Image Grid */}
      {value.length > 0 && (
        <>
          <p className="text-xs text-gray-400">
            이미지를 드래그하여 순서를 변경할 수 있습니다. 첫 번째 이미지가 대표 이미지입니다.
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={value} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {value.map((url, index) => (
                  <SortableImageItem
                    key={url}
                    url={url}
                    index={index}
                    onRemove={handleRemove}
                    uploading={uploading}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
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

          <div
            onDragEnter={handleDragOver}
            onDragLeave={handleDragOver}
            onDragOver={handleDragOver}
            onDrop={handleFileDrop}
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
              {dragActive ? "여기에 이미지를 놓으세요" : "클릭하거나 이미지를 드래그하세요"}
            </p>
            <p className="text-xs text-gray-500">JPG, PNG, WEBP, GIF (최대 5MB)</p>
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
        </div>
      )}
    </div>
  );
}
