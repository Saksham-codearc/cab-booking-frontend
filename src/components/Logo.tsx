import { BoltIcon } from "@/components/icons";

interface LogoProps {
  /** `ink` for light backgrounds, `light` for the black footer strip. */
  variant?: "ink" | "light";
  className?: string;
}

/**
 * RideFlow wordmark. Deliberately not a copy of any existing brand mark —
 * a black/yellow square with a bolt, paired with the product name.
 */
export default function Logo({ variant = "ink", className = "" }: LogoProps) {
  const isLight = variant === "light";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className={`grid h-9 w-9 place-items-center rounded-xl ${
          isLight ? "bg-brand-500 text-ink-900" : "bg-ink-900 text-brand-500"
        }`}
      >
        <BoltIcon className="h-5 w-5" strokeWidth={2} />
      </span>

      <span
        className={`text-[19px] font-extrabold tracking-tight ${
          isLight ? "text-white" : "text-ink-900"
        }`}
      >
        Ride
        <span className={isLight ? "text-brand-500" : "text-ink-900"}>Flow</span>
      </span>
    </span>
  );
}
