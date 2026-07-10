const TONES: Record<string, string> = {
  slate: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
  brand: "bg-brand/10 text-brand",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  red: "bg-red-500/10 text-red-500",
};

export function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: keyof typeof TONES }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${TONES[tone]}`}>{children}</span>;
}
