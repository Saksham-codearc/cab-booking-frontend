"use client";

import type { Ride, RideStatus } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

const STEPS: Array<{ status: RideStatus; label: string; timeKey: keyof Ride }> = [
  { status: "requested", label: "Requested", timeKey: "requested_at" },
  { status: "accepted", label: "Driver accepted", timeKey: "accepted_at" },
  { status: "arrived", label: "Driver arrived", timeKey: "arrived_at" },
  { status: "in_progress", label: "Ride started", timeKey: "started_at" },
  { status: "completed", label: "Completed", timeKey: "completed_at" },
];

export default function RideStatusTimeline({ ride }: { ride: Ride }) {
  if (ride.status === "cancelled") {
    return (
      <div className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-200">
        <p className="font-semibold">Ride cancelled</p>
        <p className="mt-1 text-red-300/80">
          {ride.cancelled_at ? formatDateTime(ride.cancelled_at) : "This ride was cancelled."}
        </p>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((step) => step.status === ride.status);

  return (
    <ol className="space-y-3">
      {STEPS.map((step, index) => {
        const done = currentIndex >= index;
        const active = currentIndex === index;
        const time = ride[step.timeKey] as string | null | undefined;
        return (
          <li key={step.status} className="flex items-start gap-3">
            <span
              className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                done
                  ? "border-cyan-400 bg-cyan-400 text-slate-950"
                  : "border-slate-700 text-slate-600"
              }`}
            >
              {done ? "✓" : index + 1}
            </span>
            <div>
              <p className={active ? "font-semibold text-cyan-300" : done ? "font-medium" : "text-slate-500"}>
                {step.label}
              </p>
              {time && <p className="text-xs text-slate-500">{formatDateTime(time)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
