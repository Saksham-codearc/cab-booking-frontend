import { Suspense } from "react";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

import Logo from "@/components/Logo";
import { CheckIcon } from "@/components/icons";
import { clerkAppearance } from "@/lib/clerk-appearance";

const PERKS = [
  "Upfront fares for every ride type",
  "Cancel while a driver is still being assigned",
  "Complete ride history in your dashboard",
];

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-ink-50">
      <header className="border-b border-brand-600/50 bg-brand-500">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 lg:px-8">
          <Link href="/" aria-label="RideFlow home">
            <Logo />
          </Link>
          <Link
            href="/"
            className="rounded-full px-3.5 py-2 text-sm font-semibold transition hover:bg-ink-900/10"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-16">
        <section className="hidden lg:block">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Welcome back.
          </h1>
          <p className="mt-3 max-w-sm text-ink-500">
            Sign in to see live fares, book a ride and keep track of every trip.
          </p>

          <ul className="mt-7 space-y-3 text-sm font-semibold">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-500 text-ink-900">
                  <CheckIcon className="h-3.5 w-3.5" strokeWidth={2.6} />
                </span>
                {perk}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex justify-center lg:justify-end">
          <Suspense
            fallback={<p className="text-sm text-ink-500">Loading sign-in…</p>}
          >
            <SignIn
              forceRedirectUrl="/dashboard"
              signUpUrl="/sign-up"
              appearance={clerkAppearance}
            />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
