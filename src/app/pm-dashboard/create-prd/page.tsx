"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function CreatePRDPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [formData, setFormData] = useState({
    title: "",
    type: "greenfield",
    background: "",
    goals: [""],
  });

  const addGoal = () => {
    setFormData({
      ...formData,
      goals: [...formData.goals, ""],
    });
  };

  const updateGoal = (index: number, value: string) => {
    const newGoals = [...formData.goals];
    newGoals[index] = value;
    setFormData({
      ...formData,
      goals: newGoals,
    });
  };

  const removeGoal = (index: number) => {
    const newGoals = formData.goals.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      goals: newGoals,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectId) {
      alert("프로젝트 ID가 필요합니다.");
      return;
    }

    try {
      const response = await fetch("/api/pm/prds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          ...formData,
          goals: formData.goals.filter((g) => g.trim() !== ""),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/pm-dashboard/projects/${projectId}`);
      } else {
        alert("PRD 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error("PRD 생성 오류:", error);
      alert("PRD 생성 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">새 PRD 작성</h1>
        <p className="text-muted-foreground">
          제품 요구사항 문서를 작성하세요
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>
              PRD의 기본 정보를 입력하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">PRD 제목 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="예: ChonCance 플랫폼 PRD"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">프로젝트 유형 *</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="greenfield">Greenfield (새 프로젝트)</option>
                <option value="brownfield">Brownfield (기존 프로젝트 개선)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="background">배경 및 맥락 *</Label>
              <Textarea
                id="background"
                value={formData.background}
                onChange={(e) =>
                  setFormData({ ...formData, background: e.target.value })
                }
                placeholder="이 PRD가 필요한 이유와 배경을 설명하세요..."
                rows={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>목표 (Goals) *</Label>
              <div className="space-y-2">
                {formData.goals.map((goal, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={goal}
                      onChange={(e) => updateGoal(index, e.target.value)}
                      placeholder={`목표 ${index + 1}`}
                      required
                    />
                    {formData.goals.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeGoal(index)}
                      >
                        삭제
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addGoal}>
                  + 목표 추가
                </Button>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit">PRD 생성</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                취소
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
