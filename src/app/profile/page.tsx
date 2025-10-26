import { UserProfile } from '@clerk/nextjs';

export default function ProfilePage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12">
      <UserProfile
        appearance={{
          elements: {
            rootBox: "w-full max-w-4xl",
            card: "shadow-md",
          }
        }}
      />
    </div>
  );
}
