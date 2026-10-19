"use client";

import Link from "next/link";
import { useClerk, useUser } from "@clerk/nextjs";
import { useProfile } from "./ProfileProvider";
import NotificationBell from "./NotificationBell";

export default function AppHeader() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { profile } = useProfile();
  const isDriver = profile?.role === "driver";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight sm:text-2xl">
          Ride<span className="text-cyan-400">Flow</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm sm:gap-2">
          <Link
            href="/dashboard"
            className="rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Ride
          </Link>
          {isDriver && (
            <Link
              href="/driver"
              className="rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Drive
            </Link>
          )}
          <Link
            href="/rides/history"
            className="rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            History
          </Link>
          {!isDriver && (
            <Link
              href="/driver/onboarding"
              className="hidden rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white sm:block"
            >
              Become a driver
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">
              {profile?.full_name || user?.firstName || "Rider"}
            </p>
            <p className="text-xs text-slate-400">
              {isDriver ? "Driver" : "Rider"}
            </p>
          </div>
          <button
            onClick={() => signOut({ redirectUrl: "/sign-in" })}
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
