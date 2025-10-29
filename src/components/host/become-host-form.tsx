"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function BecomeHostForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    businessNumber: "",
    contact: "",
    motivation: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate
      if (!formData.businessNumber || !formData.contact) {
        throw new Error("필수 항목을 모두 입력해주세요");
      }

      // Submit
      const response = await fetch("/api/host/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessNumber: formData.businessNumber,
          contact: formData.contact,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle already exists case
        if (data.code === "HOST_PROFILE_EXISTS") {
          throw new Error("이미 호스트 프로필이 존재합니다");
        }
        throw new Error(data.error || "호스트 신청에 실패했습니다");
      }

      // Success - redirect to dashboard
      alert("호스트 신청이 완료되었습니다! 검토 후 연락드리겠습니다.");
      router.push("/host/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="businessNumber">
          사업자 등록번호 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="businessNumber"
          value={formData.businessNumber}
          onChange={(e) =>
            setFormData({ ...formData, businessNumber: e.target.value })
          }
          placeholder="000-00-00000"
          required
        />
        <p className="text-sm text-gray-500">
          사업자 등록번호가 없는 경우 관리자에게 문의해주세요
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact">
          연락처 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="contact"
          type="tel"
          value={formData.contact}
          onChange={(e) =>
            setFormData({ ...formData, contact: e.target.value })
          }
          placeholder="010-0000-0000"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="motivation">호스트 신청 동기 (선택)</Label>
        <Textarea
          id="motivation"
          value={formData.motivation}
          onChange={(e) =>
            setFormData({ ...formData, motivation: e.target.value })
          }
          placeholder="촌캉스 호스트가 되고자 하는 이유를 간단히 말씀해주세요"
          rows={4}
        />
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "신청 중..." : "호스트 신청하기"}
        </Button>
      </div>

      <div className="text-sm text-gray-500 text-center">
        신청 후 24시간 내에 검토 결과를 이메일로 안내드립니다
      </div>
    </form>
  );
}
