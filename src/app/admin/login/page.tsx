"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, QrCode, RefreshCw } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expiresIn, setExpiresIn] = useState(300); // 5 minutes
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  const generateQR = async () => {
    try {
      setLoading(true);

      // Clear previous intervals
      if (pollingInterval.current) clearInterval(pollingInterval.current);
      if (timerInterval.current) clearInterval(timerInterval.current);

      // Use current origin to support both localhost and local IP
      const apiUrl = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(
        `${apiUrl}/api/admin/qr-login/generate`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("QR 코드 생성 실패");
      }

      const data = await response.json();
      setQrDataUrl(data.qrDataUrl);
      setSessionId(data.sessionId);
      setExpiresIn(data.expiresIn);

      // Start polling for login status
      startPolling(data.sessionId);

      // Start countdown timer
      startTimer(data.expiresIn);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
      alert("QR 코드 생성에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (sid: string) => {
    pollingInterval.current = setInterval(async () => {
      try {
        const apiUrl = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_API_URL;

        const response = await fetch(
          `${apiUrl}/api/admin/qr-login/status?sessionId=${sid}`
        );

        if (!response.ok) {
          throw new Error("Status check failed");
        }

        const data = await response.json();

        if (data.expired) {
          // Session expired - stop polling but don't regenerate automatically
          if (pollingInterval.current) clearInterval(pollingInterval.current);
          if (timerInterval.current) clearInterval(timerInterval.current);
          console.log("QR session expired");
          return;
        }

        if (data.authenticated) {
          // Login successful
          if (pollingInterval.current) clearInterval(pollingInterval.current);
          if (timerInterval.current) clearInterval(timerInterval.current);

          // Store JWT token in localStorage
          localStorage.setItem("admin_token", data.token);
          localStorage.setItem("admin_userId", data.userId);

          // Redirect to admin dashboard
          router.push("/admin/properties/pending");
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 2000); // Poll every 2 seconds
  };

  const startTimer = (initialTime: number) => {
    let timeLeft = initialTime;

    timerInterval.current = setInterval(() => {
      timeLeft -= 1;
      setExpiresIn(timeLeft);

      if (timeLeft <= 0) {
        if (timerInterval.current) clearInterval(timerInterval.current);
        // Auto-regenerate QR when expired
        console.log("QR timer expired, generating new QR");
        generateQR();
      }
    }, 1000);
  };

  useEffect(() => {
    generateQR();

    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <QrCode className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">VINTEE 관리자</CardTitle>
          <CardDescription>
            핸드폰으로 QR 코드를 스캔하여 로그인하세요
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* QR Code */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-[300px] h-[300px] bg-white p-4 rounded-lg shadow-lg">
                  {qrDataUrl && (
                    <Image
                      src={qrDataUrl}
                      alt="QR Code"
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  )}
                </div>

                {/* Timer */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    QR 코드 유효 시간
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {formatTime(expiresIn)}
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h3 className="font-semibold text-sm">사용 방법</h3>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>핸드폰 카메라로 QR 코드를 스캔하세요</li>
                  <li>등록된 관리자 핸드폰 번호를 입력하세요</li>
                  <li>자동으로 로그인이 완료됩니다</li>
                </ol>
              </div>

              {/* Refresh Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={generateQR}
                disabled={loading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                새 QR 코드 생성
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
