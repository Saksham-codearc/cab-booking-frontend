import { CarIcon, ClockIcon, PinIcon } from "@/components/icons";
import { formatMoney } from "@/lib/format";
import type { RideType, TripEstimate } from "@/lib/api";

interface ServicePickerProps {
  rideType: RideType;
  onSelect: (rideType: RideType) => void;
  estimate: TripEstimate | null;
  estimating: boolean;
  disabled?: boolean;
}

const SERVICES: Array<{
  value: RideType;
  label: string;
  blurb: string;
  badge?: string;
}> = [
  {
    value: "standard",
    label: "Ride Standard",
    blurb: "Everyday cars · 4 seats",
    badge: "Popular",
  },
  {
    value: "premium",
    label: "Ride Premium",
    blurb: "Newer, comfier cars · 4 seats",
  },
  {
    value: "xl",
    label: "Ride XL",
    blurb: "SUVs and vans · 6 seats",
  },
];

/**
 * Fare list: each service shows its server-calculated upfront price, and the
 * selected one is highlighted the way a booking app would.
 */
export default function ServicePicker({
  rideType,
  onSelect,
  estimate,
  estimating,
  disabled = false,
}: ServicePickerProps) {
  const ready = Boolean(estimate);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold">Choose a ride</p>

        {estimate && (
          <p className="flex items-center gap-3 text-xs text-ink-500">
            <span className="inline-flex items-center gap-1">
              <PinIcon className="h-3.5 w-3.5" />
              {estimate.distanceKm} km
            </span>
            <span className="inline-flex items-center gap-1">
              <ClockIcon className="h-3.5 w-3.5" />~{estimate.durationMin} min
            </span>
            <span className="rounded-full bg-ink-100 px-2 py-0.5 font-semibold text-ink-500">
              {estimate.source === "google" ? "live" : "approx."}
            </span>
          </p>
        )}
      </div>

      <div role="radiogroup" aria-label="Ride type" className="space-y-2">
        {SERVICES.map((service) => {
          const selected = service.value === rideType;
          const price = estimate?.fares[service.value] ?? null;

          return (
            <button
              key={service.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(service.value)}
              disabled={disabled}
              className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition disabled:opacity-60 ${
                selected
                  ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                  : "border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50"
              }`}
            >
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition ${
                  selected
                    ? "bg-brand-500 text-ink-900"
                    : "bg-ink-100 text-ink-700"
                }`}
              >
                <CarIcon className="h-6 w-6" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-bold">
                    {service.label}
                  </span>
                  {service.badge && (
                    <span className="shrink-0 rounded-md bg-ink-900 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-500">
                      {service.badge}
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block truncate text-xs text-ink-500">
                  {service.blurb}
                </span>
              </span>

              <span className="shrink-0 text-right">
                {estimating && !ready ? (
                  <span className="block h-4 w-14 animate-soft-pulse rounded bg-ink-200" />
                ) : price === null ? (
                  <span className="block text-xs text-ink-400">
                    Add locations
                  </span>
                ) : (
                  <>
                    <span className="block text-[15px] font-extrabold">
                      {formatMoney(price, estimate?.currency)}
                    </span>
                    <span className="block text-[11px] text-ink-400">
                      upfront
                    </span>
                  </>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {estimating && ready && (
        <p className="text-xs text-ink-500">Refreshing fares…</p>
      )}
    </div>
  );
}
