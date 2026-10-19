"use client";

import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  count?: number;
}

export default function StarRating({
  value,
  onChange,
  size = "md",
  showValue = false,
  count,
}: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const interactive = Boolean(onChange);
  const sizeClass = size === "lg" ? "text-3xl" : size === "sm" ? "text-sm" : "text-xl";

  return (
    <div className="flex items-center gap-1">
      <div className={`flex ${sizeClass}`} role={interactive ? "radiogroup" : undefined}>
        {[1, 2, 3, 4, 5].map((star) => {
          const active = (hover || Number(value)) >= star;
          return interactive ? (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={Number(value) === star}
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => onChange?.(star)}
              className={`px-0.5 transition ${active ? "text-amber-400" : "text-slate-600"}`}
            >
              ★
            </button>
          ) : (
            <span key={star} className={active ? "text-amber-400" : "text-slate-600"}>
              ★
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm text-slate-300">
          {Number(value || 0).toFixed(1)}
          {typeof count === "number" && (
            <span className="text-slate-500"> ({count})</span>
          )}
        </span>
      )}
    </div>
  );
}
