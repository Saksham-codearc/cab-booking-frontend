/** Formats an amount using Indian digit grouping, e.g. 149 -> "₹149". */
export function formatMoney(
  amount: number | string,
  currency = "INR"
): string {
  const value = typeof amount === "string" ? Number(amount) : amount;

  if (!Number.isFinite(value)) {
    return "—";
  }

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${Math.round(value)}`;
  }
}

/** Compact local timestamp, e.g. "19 Oct, 04:35 pm". */
export function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
