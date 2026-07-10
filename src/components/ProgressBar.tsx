export function ProgressBar({ value, tone = "brand" }: { value: number; tone?: "brand" | "emerald" }) {
  const pct = Math.max(0, Math.min(100, value));
  const barColor = tone === "emerald" ? "bg-emerald-500" : "bg-brand";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
      <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}
