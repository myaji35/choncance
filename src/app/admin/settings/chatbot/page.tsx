"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Bot, Check, AlertCircle } from "lucide-react";
import Link from "next/link";

interface ChatbotSettings {
  llmProvider: "GEMINI" | "OPENAI" | "KEYWORD";
  geminiApiKey?: string;
  openaiApiKey?: string;
}

export default function AdminChatbotSettingsPage() {
  const [settings, setSettings] = useState<ChatbotSettings>({
    llmProvider: "GEMINI",
    geminiApiKey: "",
    openaiApiKey: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Load current settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/chatbot-settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/chatbot-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "설정 저장에 실패했습니다");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Settings save error:", error);
      setError("설정 저장 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  if (loadingSettings) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin" className="text-primary hover:underline">
          ← 대시보드로 돌아가기
        </Link>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">챗봇 AI 설정</CardTitle>
                <CardDescription>
                  챗봇의 LLM 모델과 API 키를 관리합니다
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="llmProvider">LLM 제공자</Label>
                <Select
                  value={settings.llmProvider}
                  onValueChange={(value: any) =>
                    setSettings({ ...settings, llmProvider: value })
                  }
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="LLM 제공자 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GEMINI">Google Gemini (권장)</SelectItem>
                    <SelectItem value="OPENAI">OpenAI GPT</SelectItem>
                    <SelectItem value="KEYWORD">키워드 매칭 (무료)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {settings.llmProvider === "GEMINI" && "빠르고 비용 효율적인 Gemini Flash 모델"}
                  {settings.llmProvider === "OPENAI" && "강력한 GPT-4o-mini 모델"}
                  {settings.llmProvider === "KEYWORD" && "AI 없이 간단한 키워드 검색만 사용"}
                </p>
              </div>

              {settings.llmProvider === "GEMINI" && (
                <div className="space-y-2">
                  <Label htmlFor="geminiApiKey">Gemini API Key</Label>
                  <Input
                    id="geminiApiKey"
                    type="password"
                    placeholder="AIza..."
                    value={settings.geminiApiKey || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, geminiApiKey: e.target.value })
                    }
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    발급 방법:{" "}
                    <a
                      href="https://makersuite.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Google AI Studio
                    </a>
                  </p>
                </div>
              )}

              {settings.llmProvider === "OPENAI" && (
                <div className="space-y-2">
                  <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
                  <Input
                    id="openaiApiKey"
                    type="password"
                    placeholder="sk-..."
                    value={settings.openaiApiKey || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, openaiApiKey: e.target.value })
                    }
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    발급 방법:{" "}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      OpenAI Platform
                    </a>
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  설정이 성공적으로 저장되었습니다
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  "설정 저장"
                )}
              </Button>

              <div className="bg-muted p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-sm">모델 비교</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>
                    <strong className="text-foreground">Gemini Flash:</strong> 무료 / 빠름 / 자연스러운 대화 ✅
                  </div>
                  <div>
                    <strong className="text-foreground">OpenAI GPT:</strong> 유료 / 강력함 / 대화 1회당 1~5원
                  </div>
                  <div>
                    <strong className="text-foreground">키워드 매칭:</strong> 무료 / 기본 기능 / 단순 검색만
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
