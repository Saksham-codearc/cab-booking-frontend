"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import type { Ride } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import { formatCurrency, statusLabel } from "@/lib/format";
import RideStatusTimeline from "./RideStatusTimeline";

export default function ActiveRideCard({ ride, onChanged }: { ride: Ride; onChanged: () => void }) {
  const { getToken } = useAuth();
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  async function cancelRide() {
    setCancelling(true);
    setError("");
    try {
      const token = await getToken();
      await apiFetch(`/api/rides/${ride.id}/cancel`, token, { method: "POST" });
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not cancel the ride.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <section className="rounded-2xl border border-cyan-900/60 bg-slate-900 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-cyan-400">Active ride</p>
          <h3 className="mt-1 text-lg font-bold">{statusLabel(ride.status)}</h3>
        </div>
        <span className="font-semibold">{formatCurrency(ride.final_fare ?? ride.estimated_fare, ride.currency)}</span>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <p className="flex gap-2">
          <span className="text-cyan-400">●</span>
          {ride.pickup_address}
        </p>
        <p className="flex gap-2">
          <span className="text-orange-400">●</span>
          {ride.dropoff_address}
        </p>
        {ride.driver && (
          <p className="text-slate-400">
            Driver: <span className="font-medium text-slate-200">{ride.driver.full_name}</span>
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-950 p-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/rides/${ride.id}`}
          className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
        >
          Track ride
        </Link>
        {(ride.status === "requested" || ride.status === "accepted") && (
          <button
            onClick={() => void cancelRide()}
            disabled={cancelling}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-60"
          >
            {cancelling ? "Cancelling…" : "Cancel ride"}
          </button>
        )}
      </div>

      <div className="mt-5 border-t border-slate-800 pt-4">
        <RideStatusTimeline ride={ride} />
      </div>
    </section>
  );
}
