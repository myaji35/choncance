"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

interface GoogleSignInButtonProps {
  label?: string;
  callbackUrl?: string;
}

export default function GoogleSignInButton({
  label = "Google 계정으로 계속하기",
  callbackUrl = "/",
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50"
    >
      <svg width={18} height={18} viewBox="0 0 18 18" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26a5.4 5.4 0 0 1-8.04-2.83H1v2.33A9 9 0 0 0 9 18z"
        />
        <path
          fill="#FBBC05"
          d="M3.96 10.73a5.4 5.4 0 0 1 0-3.46V4.94H1a9 9 0 0 0 0 8.08l2.96-2.3z"
        />
        <path
          fill="#EA4335"
          d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58A9 9 0 0 0 1 4.94l2.96 2.33A5.4 5.4 0 0 1 9 3.58z"
        />
      </svg>
      {loading ? "Google로 이동 중..." : label}
    </button>
  );
}
