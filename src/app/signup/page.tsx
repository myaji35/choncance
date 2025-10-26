"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

// Zod validation schema
const signupSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z
    .string()
    .min(8, "비밀번호는 8자 이상이어야 합니다")
    .regex(/[A-Za-z]/, "비밀번호는 영문을 포함해야 합니다")
    .regex(/\d/, "비밀번호는 숫자를 포함해야 합니다"),
  passwordConfirm: z.string(),
  name: z.string().min(2, "이름은 2자 이상이어야 합니다").max(50, "이름은 50자 이하여야 합니다"),
  phone: z.string().regex(/^\d{3}-\d{4}-\d{4}$/, "전화번호 형식: 010-1234-5678"),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: "이용약관에 동의해주세요",
  }),
  agreedToPrivacy: z.boolean().refine((val) => val === true, {
    message: "개인정보 처리방침에 동의해주세요",
  }),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["passwordConfirm"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      agreedToTerms: false,
      agreedToPrivacy: false,
    },
  });

  const agreedToTerms = watch("agreedToTerms");
  const agreedToPrivacy = watch("agreedToPrivacy");

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
          phone: data.phone,
          agreed_to_terms: data.agreedToTerms,
          agreed_to_privacy: data.agreedToPrivacy,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.detail?.code === "EMAIL_ALREADY_EXISTS") {
          setError("이미 가입된 이메일입니다");
        } else {
          setError(result.detail?.message || "회원가입에 실패했습니다");
        }
        return;
      }

      // Store JWT token
      localStorage.setItem("access_token", result.access_token);

      // Store user info (optional, for UI display)
      localStorage.setItem("user", JSON.stringify(result.user));

      // Show success message
      alert("가입이 완료되었습니다!");

      // Redirect to main page
      router.push("/");
    } catch (err) {
      setError("서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
      console.error("Signup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">회원가입</CardTitle>
          <CardDescription className="text-center">
            이메일과 비밀번호를 입력하여 회원가입하세요.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                type="text"
                placeholder="홍길동"
                {...register("name")}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="010-1234-5678"
                {...register("phone")}
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="영문, 숫자 포함 8자 이상"
                {...register("password")}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
              <Input
                id="passwordConfirm"
                type="password"
                {...register("passwordConfirm")}
                disabled={isLoading}
              />
              {errors.passwordConfirm && (
                <p className="text-sm text-red-500">{errors.passwordConfirm.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreedToTerms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setValue("agreedToTerms", checked as boolean)}
                  disabled={isLoading}
                />
                <label
                  htmlFor="agreedToTerms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  이용약관에 동의합니다 (필수)
                </label>
              </div>
              {errors.agreedToTerms && (
                <p className="text-sm text-red-500">{errors.agreedToTerms.message}</p>
              )}

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreedToPrivacy"
                  checked={agreedToPrivacy}
                  onCheckedChange={(checked) => setValue("agreedToPrivacy", checked as boolean)}
                  disabled={isLoading}
                />
                <label
                  htmlFor="agreedToPrivacy"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  개인정보 처리방침에 동의합니다 (필수)
                </label>
              </div>
              {errors.agreedToPrivacy && (
                <p className="text-sm text-red-500">{errors.agreedToPrivacy.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "가입 중..." : "회원가입"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  또는 다음으로 회원가입
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button type="button" variant="outline" disabled>
                카카오
              </Button>
              <Button type="button" variant="outline" disabled>
                구글
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Link href="/login" className="text-sm text-blue-600 hover:underline">
              이미 계정이 있으신가요? 로그인
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}