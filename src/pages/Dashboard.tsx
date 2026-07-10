import { motion } from "framer-motion";
import { Wallet, TrendingDown, PiggyBank, Sparkles, Lightbulb, CalendarClock } from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import { StatCard } from "../components/StatCard";
import { InsightsCarousel } from "../components/InsightsCarousel";
import { ProgressBar } from "../components/ProgressBar";
import { EmptyState } from "../components/EmptyState";
import { formatCurrency, formatDate } from "../lib/format";
import { LoadingScreen } from "../components/LoadingScreen";

export default function Dashboard() {
  const { data, isLoading, isError, error } = useDashboard();

  if (isLoading) return <LoadingScreen label="Loading dashboard..." />;

  if (isError) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Couldn't load your dashboard"
        description={(error as Error)?.message || "Something went wrong"}
      />
    );
  }

  const freeMoney = data.freeMoney ?? 0;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">A quick look at where your money stands this month.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Monthly income" value={formatCurrency(data.income)} icon={Wallet} />
        <StatCard label="Monthly payments" value={formatCurrency(data.monthlyPayments)} icon={TrendingDown} tone="negative" />
        <StatCard label="Monthly savings" value={formatCurrency(data.monthlySavings)} icon={PiggyBank} />
        <StatCard
          label="Free money"
          value={formatCurrency(freeMoney)}
          icon={Sparkles}
          tone={freeMoney >= 0 ? "positive" : "negative"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <CalendarClock size={18} className="text-brand" />
            <h2 className="font-semibold text-slate-900 dark:text-white">Upcoming payments</h2>
          </div>
          {data.upcomingPayments?.length ? (
            <ul className="divide-y divide-surface-lightBorder dark:divide-surface-darkBorder">
              {data.upcomingPayments.map((p: any) => (
                <li key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{p.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(p.dueDate)}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(p.amount)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">Nothing due soon. You're all caught up.</p>
          )}
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb size={18} className="text-brand" />
              <h2 className="font-semibold text-slate-900 dark:text-white">Insights</h2>
            </div>
            {data.insights?.length > 1 && (
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{data.insights.length} tips</span>
            )}
          </div>
          <InsightsCarousel insights={data.insights || []} />
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PiggyBank size={18} className="text-brand" />
            <h2 className="font-semibold text-slate-900 dark:text-white">Savings buckets</h2>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{data.buckets?.length || 0} active</span>
        </div>

        {data.buckets?.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.buckets.map((b: any) => {
              const pct = b.target_amount > 0 ? (Number(b.current_amount) / Number(b.target_amount)) * 100 : 0;
              return (
                <div key={b.id} className="rounded-xl2 border border-surface-lightBorder p-4 dark:border-surface-darkBorder">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                      <span>{b.icon}</span>
                      {b.name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{Math.round(pct)}%</span>
                  </div>
                  <ProgressBar value={pct} tone="emerald" />
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {formatCurrency(b.current_amount)} of {formatCurrency(b.target_amount)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
            No buckets yet — create one from the Buckets tab.
          </p>
        )}
      </div>
    </motion.div>
  );
}
