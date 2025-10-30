"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const hostProfileSchema = z.object({
  businessNumber: z
    .string()
    .min(1, "사업자 번호를 입력해주세요")
    .regex(/^\d{3}-\d{2}-\d{5}$/, "사업자 번호 형식이 올바르지 않습니다 (예: 123-45-67890)"),
  contact: z
    .string()
    .min(1, "연락처를 입력해주세요")
    .regex(/^010-\d{4}-\d{4}$/, "연락처 형식이 올바르지 않습니다 (예: 010-1234-5678)"),
});

type HostProfileFormData = z.infer<typeof hostProfileSchema>;

interface HostProfileEditFormProps {
  initialData: {
    businessNumber: string;
    contact: string;
  };
  onSuccess?: () => void;
}

export function HostProfileEditForm({
  initialData,
  onSuccess,
}: HostProfileEditFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<HostProfileFormData>({
    resolver: zodResolver(hostProfileSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: HostProfileFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/host/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "프로필 수정에 실패했습니다");
      }

      router.refresh();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Profile update error:", err);
      setError(err.message || "프로필 수정 중 오류가 발생했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Business Number */}
      <div className="space-y-2">
        <Label htmlFor="businessNumber">
          사업자 번호 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="businessNumber"
          type="text"
          placeholder="123-45-67890"
          {...register("businessNumber")}
          className={errors.businessNumber ? "border-red-500" : ""}
        />
        {errors.businessNumber && (
          <p className="text-sm text-red-500">{errors.businessNumber.message}</p>
        )}
        <p className="text-xs text-gray-500">
          형식: 000-00-00000
        </p>
      </div>

      {/* Contact */}
      <div className="space-y-2">
        <Label htmlFor="contact">
          연락처 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="contact"
          type="tel"
          placeholder="010-1234-5678"
          {...register("contact")}
          className={errors.contact ? "border-red-500" : ""}
        />
        {errors.contact && (
          <p className="text-sm text-red-500">{errors.contact.message}</p>
        )}
        <p className="text-xs text-gray-500">
          형식: 010-0000-0000
        </p>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              저장 중...
            </>
          ) : (
            "저장하기"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          취소
        </Button>
      </div>
    </form>
  );
}
