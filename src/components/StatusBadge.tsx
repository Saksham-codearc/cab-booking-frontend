const STATUS_MAP: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  requested: {
    label: "Searching",
    className: "border-brand-300 bg-brand-50 text-ink-900",
    dot: "bg-brand-500",
  },
  accepted: {
    label: "Driver assigned",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  arrived: {
    label: "Arriving",
    className: "border-violet-200 bg-violet-50 text-violet-700",
    dot: "bg-violet-500",
  },
  in_progress: {
    label: "On trip",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  completed: {
    label: "Completed",
    className: "border-ink-200 bg-ink-100 text-ink-700",
    dot: "bg-ink-700",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
};

export default function StatusBadge({ status }: { status: string }) {
  const fallback = {
    label: status.replace(/_/g, " "),
    className: "border-ink-200 bg-ink-100 text-ink-700",
    dot: "bg-ink-400",
  };

  const config = STATUS_MAP[status] ?? fallback;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${config.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
