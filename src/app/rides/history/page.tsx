"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

import AppHeader from "@/components/AppHeader";
import RideCard from "@/components/RideCard";
import { apiFetch } from "@/lib/api";
import type { Ride, RideStatus } from "@/lib/types";

type Filter = "all" | "active" | "completed" | "cancelled";

const ACTIVE_STATUSES: RideStatus[] = ["requested", "accepted", "arrived", "in_progress"];

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function RideHistoryPage() {
  const { getToken } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const loadRides = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const data = await apiFetch<{ rides: Ride[] }>("/api/rides?limit=50", token);
      setRides(data.rides ?? []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your ride history.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void Promise.resolve().then(() => loadRides());
  }, [loadRides]);

  const filtered = useMemo(() => {
    if (filter === "all") return rides;
    if (filter === "active") return rides.filter((ride) => ACTIVE_STATUSES.includes(ride.status));
    return rides.filter((ride) => ride.status === filter);
  }, [rides, filter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AppHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-16 sm:px-6 lg:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">
              Ride history
            </p>
            <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Every trip, in one place
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {loading
                ? "Loading your rides…"
                : `${rides.length} ride${rides.length === 1 ? "" : "s"} on this account.`}
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
          >
            Book a ride
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter rides">
          {FILTERS.map((item) => {
            const selected = filter === item.key;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setFilter(item.key)}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                  selected
                    ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                    : "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-800/60 bg-amber-950/40 p-4 text-sm text-amber-200"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void loadRides()}
              className="rounded-lg border border-amber-700 px-3 py-1.5 text-xs font-semibold transition hover:bg-amber-900/40"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-40 animate-pulse rounded-xl border border-slate-800 bg-slate-900"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-8 text-center">
            <p className="font-semibold text-slate-200">
              {rides.length === 0 ? "No rides yet" : `No ${filter} rides`}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {rides.length === 0
                ? "Your first booking will appear here."
                : "Try a different filter to see more trips."}
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {filtered.map((ride) => (
              <RideCard key={ride.id} ride={ride} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
