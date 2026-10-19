import StatusBadge from "@/components/StatusBadge";
import { CarIcon, PinIcon } from "@/components/icons";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { Ride } from "@/lib/api";

interface RideHistoryProps {
  rides: Ride[];
  loading: boolean;
  error: string;
  cancellingId: string | null;
  onCancel: (id: string) => void;
  onRefresh: () => void;
}

function RideCard({
  ride,
  cancelling,
  onCancel,
}: {
  ride: Ride;
  cancelling: boolean;
  onCancel: (id: string) => void;
}) {
  return (
    <article className="rounded-3xl border border-ink-200 bg-white p-4 shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink-100 text-ink-700">
            <CarIcon className="h-5 w-5" />
          </span>
          <span className="text-sm font-bold capitalize">
            Ride {ride.vehicle_type}
          </span>
        </span>

        <StatusBadge status={ride.status} />
      </div>

      <div className="relative mt-4 space-y-3 pl-1">
        <span
          aria-hidden="true"
          className="absolute bottom-[1.35rem] left-[0.42rem] top-[0.5rem] border-l-2 border-dotted border-ink-300"
        />

        <p className="flex items-start gap-3 text-sm">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
          <span className="min-w-0 flex-1 font-medium text-ink-700">
            {ride.pickup_address}
          </span>
        </p>

        <p className="flex items-start gap-3 text-sm">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-[3px] bg-rose-500" />
          <span className="min-w-0 flex-1 font-medium text-ink-700">
            {ride.dropoff_address}
          </span>
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-3.5">
        <span className="inline-flex items-center gap-2 text-xs text-ink-500">
          <PinIcon className="h-3.5 w-3.5" />
          {formatDateTime(ride.requested_at)}
        </span>

        <span className="flex items-center gap-3">
          <span className="text-sm font-extrabold">
            {formatMoney(ride.estimated_fare, ride.currency)}
          </span>

          {ride.status === "requested" && (
            <button
              type="button"
              onClick={() => onCancel(ride.id)}
              disabled={cancelling}
              className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
            >
              {cancelling ? "Cancelling…" : "Cancel ride"}
            </button>
          )}
        </span>
      </div>
    </article>
  );
}

export default function RideHistory({
  rides,
  loading,
  error,
  cancellingId,
  onCancel,
  onRefresh,
}: RideHistoryProps) {
  return (
    <section id="rides" className="scroll-mt-24">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold">Your rides</h2>
          <p className="text-sm text-ink-500">
            Track requests and cancel within the waiting window.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="rounded-full border border-ink-200 bg-white px-3.5 py-2 text-xs font-bold text-ink-700 transition hover:bg-ink-100 disabled:opacity-50"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {loading && rides.length === 0 ? (
        <div className="space-y-3" aria-busy="true">
          {[0, 1].map((key) => (
            <div
              key={key}
              className="animate-soft-pulse rounded-3xl border border-ink-200 bg-white p-4"
            >
              <div className="h-4 w-32 rounded bg-ink-100" />
              <div className="mt-4 h-4 w-full rounded bg-ink-100" />
              <div className="mt-3 h-4 w-2/3 rounded bg-ink-100" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p
          role="alert"
          className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700"
        >
          {error}
        </p>
      ) : rides.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-ink-300 bg-white p-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-500 text-ink-900">
            <CarIcon className="h-6 w-6" />
          </span>
          <p className="mt-3 text-sm font-bold">No rides yet</p>
          <p className="mt-1 text-sm text-ink-500">
            Book your first ride and it will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rides.map((ride) => (
            <RideCard
              key={ride.id}
              ride={ride}
              cancelling={cancellingId === ride.id}
              onCancel={onCancel}
            />
          ))}
        </div>
      )}
    </section>
  );
}
