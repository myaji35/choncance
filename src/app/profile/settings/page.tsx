import { UserProfile } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProfileSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link href="/profile">
          <Button variant="ghost" size="sm" className="mb-4">
            ← 프로필로 돌아가기
          </Button>
        </Link>

        <div className="flex items-center justify-center">
          <UserProfile
            appearance={{
              elements: {
                rootBox: "w-full max-w-4xl",
                card: "shadow-md",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
