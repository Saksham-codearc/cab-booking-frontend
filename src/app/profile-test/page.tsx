"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";

import Logo from "@/components/Logo";
import { apiFetch } from "@/lib/api";

export default function ProfileTestPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function syncProfile() {
    setLoading(true);
    setMessage("");

    try {
      const token = await getToken();

      if (!token) {
        throw new Error("Could not get your Clerk session token.");
      }

      const result = await apiFetch<Record<string, unknown>>(
        "/api/profile/sync",
        token,
        { method: "POST" }
      );

      setMessage(JSON.stringify(result, null, 2));
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-50 pb-16">
      <header className="border-b border-brand-600/50 bg-brand-500">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3 lg:px-8">
          <Link href="/dashboard" aria-label="RideFlow dashboard">
            <Logo />
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full px-3.5 py-2 text-sm font-semibold transition hover:bg-ink-900/10"
          >
            Back to booking
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-8 lg:px-8">
        {!isLoaded ? (
          <p className="text-sm font-semibold text-ink-500">
            Loading session…
          </p>
        ) : !isSignedIn ? (
          <div className="card p-6">
            <p className="text-sm font-bold">You are signed out</p>
            <Link href="/sign-in" className="btn-ink mt-4 px-5 py-3 text-sm">
              Go to sign in
            </Link>
          </div>
        ) : (
          <div className="card p-6">
            <h1 className="text-xl font-extrabold tracking-tight">
              Profile sync
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              Creates or refreshes your backend profile record for{" "}
              <span className="font-semibold text-ink-900">
                {user?.primaryEmailAddress?.emailAddress ?? user?.id}
              </span>
              .
            </p>

            <button
              type="button"
              onClick={syncProfile}
              disabled={loading}
              className="btn-brand mt-5 w-full px-5 py-3.5 text-base disabled:opacity-60 sm:w-auto"
            >
              {loading ? "Synchronizing…" : "Sync my profile"}
            </button>

            {message && (
              <pre className="mt-5 max-h-80 overflow-auto rounded-2xl border border-ink-200 bg-ink-50 p-4 text-xs leading-5 text-ink-700">
                {message}
              </pre>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
