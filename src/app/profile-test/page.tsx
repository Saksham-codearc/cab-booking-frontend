
"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profile/sync`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Profile sync failed.");
      }

      setMessage(JSON.stringify(result, null, 2));
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!isLoaded) {
    return <main className="p-8">Loading session...</main>;
  }

  if (!isSignedIn) {
    return (
      <main className="p-8">
        <p>Please sign in first.</p>
        <Link className="underline" href="/sign-in">
          Go to sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl space-y-4 p-8">
      <h1 className="text-2xl font-bold">Profile Sync Test</h1>

      <p>
        Signed in as: {user?.primaryEmailAddress?.emailAddress ?? user?.id}
      </p>

      <button
        onClick={syncProfile}
        disabled={loading}
        className="rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50"
      >
        {loading ? "Synchronizing..." : "Sync My Profile"}
      </button>

      {message && (
        <pre className="overflow-auto rounded-lg bg-gray-100 p-4 text-sm text-black">
          {message}
        </pre>
      )}
    </main>
  );
}
