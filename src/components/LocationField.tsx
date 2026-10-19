import { SwapIcon } from "@/components/icons";

interface LocationFieldProps {
  pickup: string;
  destination: string;
  onPickupChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onSwap: () => void;
  disabled?: boolean;
}

/**
 * Rapido-style pickup / drop entry: dotted rail with a green pickup dot and a
 * rose drop square, plus a swap control.
 */
export default function LocationField({
  pickup,
  destination,
  onPickupChange,
  onDestinationChange,
  onSwap,
  disabled = false,
}: LocationFieldProps) {
  return (
    <div className="relative rounded-2xl border border-ink-200 bg-white">
      <span
        aria-hidden="true"
        className="absolute bottom-[2.4rem] left-[1.9rem] top-[2.4rem] border-l-2 border-dotted border-ink-300"
      />

      <div className="pr-14">
        <label className="flex items-center gap-3 px-3.5 py-3">
          <span className="grid w-8 shrink-0 place-items-center">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
          </span>

          <span className="sr-only">Pickup location</span>
          <input
            value={pickup}
            onChange={(event) => onPickupChange(event.target.value)}
            disabled={disabled}
            placeholder="Enter pickup location"
            autoComplete="off"
            className="w-full min-w-0 bg-transparent py-1.5 text-[15px] font-semibold text-ink-900 outline-none placeholder:font-normal placeholder:text-ink-400 disabled:opacity-60"
          />
        </label>

        <div className="mx-4 border-t border-ink-100" />

        <label className="flex items-center gap-3 px-3.5 py-3">
          <span className="grid w-8 shrink-0 place-items-center">
            <span className="h-2.5 w-2.5 rounded-[3px] bg-rose-500 ring-4 ring-rose-100" />
          </span>

          <span className="sr-only">Drop location</span>
          <input
            value={destination}
            onChange={(event) => onDestinationChange(event.target.value)}
            disabled={disabled}
            placeholder="Enter drop location"
            autoComplete="off"
            className="w-full min-w-0 bg-transparent py-1.5 text-[15px] font-semibold text-ink-900 outline-none placeholder:font-normal placeholder:text-ink-400 disabled:opacity-60"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={onSwap}
        disabled={disabled}
        aria-label="Swap pickup and drop locations"
        className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-ink-200 bg-white text-ink-700 transition hover:bg-ink-50 disabled:opacity-50"
      >
        <SwapIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
