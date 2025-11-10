"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, Smartphone } from "lucide-react";

function QRVerifyContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setMessage("유효하지 않은 QR 코드입니다");
    }
  }, [sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone) {
      alert("핸드폰 번호를 입력해주세요");
      return;
    }

    setLoading(true);

    try {
      // Use current origin instead of env var to work with local IP
      const apiUrl = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(
        `${apiUrl}/api/admin/qr-login/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            phone,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error || "인증에 실패했습니다");
        return;
      }

      setStatus("success");
      setMessage(data.message || "인증이 완료되었습니다");
    } catch (error) {
      console.error("Verification failed:", error);
      setStatus("error");
      setMessage("네트워크 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">관리자 인증</CardTitle>
          <CardDescription>
            등록된 핸드폰 번호를 입력하여 관리자 로그인을 완료하세요
          </CardDescription>
        </CardHeader>

        <CardContent>
          {status === "idle" && sessionId && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">핸드폰 번호</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="010-1234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
                <p className="text-sm text-muted-foreground">
                  하이픈(-) 포함 또는 제외하고 입력 가능합니다
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !phone}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    인증 중...
                  </>
                ) : (
                  "인증하기"
                )}
              </Button>
            </form>
          )}

          {status === "success" && (
            <div className="text-center py-6 space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900">
                  인증 완료
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {message}
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  PC 화면에서 자동으로 로그인됩니다.
                  <br />
                  이 창을 닫아도 됩니다.
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-6 space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-900">
                  인증 실패
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {message}
                </p>
              </div>
              {sessionId && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatus("idle");
                    setMessage("");
                    setPhone("");
                  }}
                  className="mt-4"
                >
                  다시 시도
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function QRVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <QRVerifyContent />
    </Suspense>
  );
}
