import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useDebts } from "../hooks/useDebts";
import { useExpenses } from "../hooks/useExpenses";
import { LoadingScreen } from "../components/LoadingScreen";
import { EmptyState } from "../components/EmptyState";
import { buildMonthGrid, isSameDay } from "../lib/calendarGrid";
import { formatCurrency, formatDate } from "../lib/format";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface DueItem {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  kind: "debt" | "expense";
}

export default function Calendar() {
  const { data: debts, isLoading: debtsLoading } = useDebts();
  const { data: expenses, isLoading: expensesLoading } = useExpenses();
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  if (debtsLoading || expensesLoading) return <LoadingScreen label="Loading calendar..." />;

  const dueItems: DueItem[] = [
    ...(debts || [])
      .filter((d: any) => d.status === "active" && d.next_due_date)
      .map((d: any): DueItem => ({ id: d.id, name: d.name, amount: Number(d.monthly_payment), dueDate: d.next_due_date, kind: "debt" })),
    ...(expenses || [])
      .filter((e: any) => e.is_active && e.next_due_date)
      .map((e: any): DueItem => ({ id: e.id, name: e.name, amount: Number(e.amount), dueDate: e.next_due_date, kind: "expense" })),
  ];

  const weeks = buildMonthGrid(cursor.getFullYear(), cursor.getMonth());

  function itemsOnDay(day: Date) {
    return dueItems.filter((item) => isSameDay(new Date(item.dueDate), day));
  }

  const upcomingThisMonth = dueItems
    .filter((item) => {
      const due = new Date(item.dueDate);
      return due.getFullYear() === cursor.getFullYear() && due.getMonth() === cursor.getMonth();
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Calendar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Every upcoming due date, at a glance.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost !p-2" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
            <ChevronLeft size={18} />
          </button>
          <span className="min-w-[9rem] text-center text-sm font-medium text-slate-900 dark:text-white">
            {MONTH_NAMES[cursor.getMonth()]} {cursor.getFullYear()}
          </span>
          <button className="btn-ghost !p-2" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {dueItems.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No due dates yet" description="Debts and expenses with a next due date will show up here." />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="card p-4 lg:col-span-2">
            <div className="mb-2 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand" />Debt</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Expense</span>
            </div>
            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
              {WEEKDAYS.map((w) => (
                <div key={w} className="py-1">{w}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {weeks.flat().map((day, i) => {
                const items = day ? itemsOnDay(day) : [];
                const isToday = day && isSameDay(day, today);
                return (
                  <div
                    key={i}
                    className={`min-h-[4.5rem] rounded-lg border p-1.5 text-xs ${
                      day
                        ? "border-surface-lightBorder dark:border-surface-darkBorder"
                        : "border-transparent"
                    } ${isToday ? "bg-brand/10 border-brand/40" : ""}`}
                  >
                    {day && (
                      <>
                        <span className={`font-medium ${isToday ? "text-brand" : "text-slate-500 dark:text-slate-400"}`}>
                          {day.getDate()}
                        </span>
                        <div className="mt-1 space-y-1">
                          {items.slice(0, 2).map((item) => (
                            <div
                              key={item.id}
                              className={`truncate rounded px-1 py-0.5 text-[10px] font-medium ${
                                item.kind === "expense" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-brand/10 text-brand"
                              }`}
                            >
                              {item.name}
                            </div>
                          ))}
                          {items.length > 2 && (
                            <div className="text-[10px] text-slate-400">+{items.length - 2} more</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">Due this month</h2>
            {upcomingThisMonth.length ? (
              <ul className="space-y-3">
                {upcomingThisMonth.map((item) => (
                  <li key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{item.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(item.dueDate)}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(item.amount)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Nothing due this month.</p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
