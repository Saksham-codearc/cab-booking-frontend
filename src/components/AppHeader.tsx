"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";

import Logo from "@/components/Logo";
import { LogoutIcon } from "@/components/icons";

const NAV_LINKS = [
  { href: "/dashboard", label: "Book a ride", match: "/dashboard" },
  { href: "/dashboard#rides", label: "My rides", match: "#rides" },
];

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);

  if (parts.length === 0) {
    return "R";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "R";
}

/** Yellow app bar used across the authenticated booking screens. */
export default function AppHeader() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();

  const name =
    user?.fullName ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress ||
    "Rider";

  return (
    <header className="sticky top-0 z-40 border-b border-brand-600/40 bg-brand-500">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
        <Link href="/dashboard" aria-label="RideFlow home">
          <Logo />
        </Link>

        <nav aria-label="Sections" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = link.match === "/dashboard" && pathname === "/dashboard";

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-ink-900 text-white"
                    : "text-ink-900 hover:bg-ink-900/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full bg-white/60 px-1.5 py-1 pr-3 sm:flex">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-ink-900 text-xs font-bold text-brand-500">
              {initialsFor(name)}
            </span>
            <span className="max-w-[10rem] truncate text-sm font-semibold">
              {name}
            </span>
          </span>

          <button
            type="button"
            onClick={() => signOut({ redirectUrl: "/sign-in" })}
            className="btn-ink px-3.5 py-2 text-sm"
          >
            <LogoutIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
