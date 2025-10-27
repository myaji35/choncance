import { SignUp } from '@clerk/nextjs';

export default function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12">
      <SignUp
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card: "shadow-md",
          }
        }}
      />
    </div>
  );
}
