
import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Suspense fallback={<p>Loading sign-in...</p>}>
        <SignIn
          forceRedirectUrl="/dashboard"
          signUpUrl="/sign-up"
        />
      </Suspense>
    </main>
  );
}

