export function StatusPill({ status }: { status: string }) {
  const tone =
    status === "confirmed" || status === "delivered" || status === "paid" || status === "completed" || status === "resolved"
      ? "bg-emerald-800/10 text-emerald-900"
      : status === "rejected" || status === "cancelled" || status === "failed" || status === "spam"
        ? "bg-red-700/10 text-red-800"
        : "bg-gold/20 text-charcoal";
  return <span className={`px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] ${tone}`}>{status.replace(/_/g, " ")}</span>;
}
