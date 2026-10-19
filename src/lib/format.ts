export function formatCurrency(value: number | string | null | undefined, currency = "INR") {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function statusLabel(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export const rideTypeLabels: Record<string, string> = {
  standard: "Ride Standard",
  premium: "Ride Premium",
  xl: "Ride XL",
};

export const rideTypeDescriptions: Record<string, string> = {
  standard: "Everyday cars, best value",
  premium: "Comfortable sedans",
  xl: "Extra space for groups",
};
