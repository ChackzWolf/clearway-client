import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "default" | "positive" | "negative";
}) {
  const toneClasses =
    tone === "positive"
      ? "bg-emerald-500/10 text-emerald-500"
      : tone === "negative"
      ? "bg-red-500/10 text-red-500"
      : "bg-brand/10 text-brand";

  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl2 ${toneClasses}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="truncate text-xl font-semibold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
