"use client";

import Link from "next/link";
import type { Ride } from "@/lib/types";
import { formatCurrency, formatDateTime, rideTypeLabels, statusLabel } from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  requested: "bg-amber-500/15 text-amber-300 border-amber-700/50",
  accepted: "bg-cyan-500/15 text-cyan-300 border-cyan-700/50",
  arrived: "bg-blue-500/15 text-blue-300 border-blue-700/50",
  in_progress: "bg-indigo-500/15 text-indigo-300 border-indigo-700/50",
  completed: "bg-emerald-500/15 text-emerald-300 border-emerald-700/50",
  cancelled: "bg-red-500/15 text-red-300 border-red-800/50",
};

export default function RideCard({ ride, perspective = "rider" }: { ride: Ride; perspective?: "rider" | "driver" }) {
  const otherPerson = perspective === "rider" ? ride.driver : ride.rider;

  return (
    <Link
      href={`/rides/${ride.id}`}
      className="block rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold">{rideTypeLabels[ride.vehicle_type] ?? ride.vehicle_type}</span>
        <span
          className={`rounded-full border px-3 py-0.5 text-xs ${
            STATUS_STYLES[ride.status] ?? "border-slate-700 bg-slate-800 text-slate-300"
          }`}
        >
          {statusLabel(ride.status)}
        </span>
      </div>

      <div className="mt-3 space-y-2 text-sm">
        <p className="flex gap-2">
          <span className="text-cyan-400">●</span>
          <span className="text-slate-200">{ride.pickup_address}</span>
        </p>
        <p className="flex gap-2">
          <span className="text-orange-400">●</span>
          <span className="text-slate-200">{ride.dropoff_address}</span>
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3 text-sm">
        <span className="text-slate-500">{formatDateTime(ride.requested_at)}</span>
        <div className="flex items-center gap-3">
          {otherPerson?.full_name && (
            <span className="text-slate-400">
              {perspective === "rider" ? "Driver" : "Rider"}: {otherPerson.full_name}
            </span>
          )}
          <span className="font-semibold">
            {formatCurrency(ride.final_fare ?? ride.estimated_fare, ride.currency)}
          </span>
        </div>
      </div>
    </Link>
  );
}
