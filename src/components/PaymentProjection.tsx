import { TrendingDown } from "lucide-react";
import { buildMonthlyProjection, type ProjectableItem } from "../lib/projection";
import { formatCurrency } from "../lib/format";

export function PaymentProjection({ items, title = "Next few months" }: { items: ProjectableItem[]; title?: string }) {
  if (items.length === 0) return null;
  const projection = buildMonthlyProjection(items, 6);

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-2">
        <TrendingDown size={18} className="text-brand" />
        <h2 className="font-semibold text-slate-900 dark:text-white">{title}</h2>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {projection.map((p, i) => (
          <div
            key={i}
            className={`rounded-xl2 border p-3 text-center ${
              i === 0 ? "border-brand bg-brand/5" : "border-surface-lightBorder dark:border-surface-darkBorder"
            }`}
          >
            <p className="text-xs text-slate-500 dark:text-slate-400">{p.label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(p.total)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
