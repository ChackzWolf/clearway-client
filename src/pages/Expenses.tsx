import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Repeat, Pencil, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { useExpenses, useDeleteExpense, useRecordExpensePayment } from "../hooks/useExpenses";
import { useHouseholdStore } from "../store/useHouseholdStore";
import { EmptyState } from "../components/EmptyState";
import { LoadingScreen } from "../components/LoadingScreen";
import { Badge } from "../components/Badge";
import { StatCard } from "../components/StatCard";
import { ExpenseFormModal } from "../components/ExpenseFormModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { formatCurrency, formatDate } from "../lib/format";

function cycleLabel(months: number): string {
  if (months === 1) return "Monthly";
  if (months === 12) return "Yearly";
  return `Every ${months} months`;
}

export default function Expenses() {
  const { data: expenses, isLoading } = useExpenses();
  const { members } = useHouseholdStore();
  const deleteExpense = useDeleteExpense();
  const recordPayment = useRecordExpensePayment();
  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [deletingExpense, setDeletingExpense] = useState<any>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  if (isLoading) return <LoadingScreen label="Loading expenses..." />;

  const active = (expenses || []).filter((e: any) => e.is_active);
  const totalMonthly = active.reduce((s: number, e: any) => s + Number(e.amount) / e.billing_cycle_months, 0);

  function ownerLabel(e: any) {
    if (e.is_shared) return "Shared";
    return members.find((m) => m.id === e.owner_member_id)?.displayName || "Unassigned";
  }

  async function onConfirmDelete() {
    if (!deletingExpense) return;
    await deleteExpense.mutateAsync(deletingExpense.id);
    setDeletingExpense(null);
  }

  async function markPaid(expense: any) {
    setBusyId(expense.id);
    try {
      await recordPayment.mutateAsync(expense.id);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Expenses</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Subscriptions, recharges, memberships — anything that repeats.</p>
        </div>
        <button className="btn-primary" onClick={() => setFormOpen(true)}>
          <Plus size={16} />
          Add expense
        </button>
      </div>

      {active.length > 0 && (
        <StatCard label="Monthly equivalent" value={formatCurrency(totalMonthly)} icon={Repeat} tone="negative" />
      )}

      {!expenses || expenses.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="No recurring expenses yet"
          description="Add subscriptions, phone recharges, gym memberships — anything that repeats on its own schedule."
          action={
            <button className="btn-primary" onClick={() => setFormOpen(true)}>
              <Plus size={16} />
              Add expense
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((e: any) => (
            <div key={e.id} className="card p-5">
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{e.icon}</span>
                  <p className="font-medium text-slate-900 dark:text-white">{e.name}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditingExpense(e)} className="btn-ghost !p-1.5" aria-label="Edit expense">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setDeletingExpense(e)} className="btn-ghost !p-1.5 hover:text-red-500" aria-label="Delete expense">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <p className="text-lg font-semibold text-slate-900 dark:text-white">{formatCurrency(e.amount)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {cycleLabel(e.billing_cycle_months)} · ≈ {formatCurrency(Number(e.amount) / e.billing_cycle_months)}/mo
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge>{e.category}</Badge>
                <Badge tone="brand">{ownerLabel(e)}</Badge>
              </div>

              {e.next_due_date && (
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Next due {formatDate(e.next_due_date)}</p>
              )}

              <button onClick={() => markPaid(e)} disabled={busyId === e.id} className="btn-primary mt-3 w-full justify-center text-sm">
                {busyId === e.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Mark paid
              </button>
            </div>
          ))}
        </div>
      )}

      <ExpenseFormModal open={formOpen} onClose={() => setFormOpen(false)} />
      <ExpenseFormModal open={!!editingExpense} expense={editingExpense} onClose={() => setEditingExpense(null)} />
      <ConfirmDialog
        open={!!deletingExpense}
        title="Delete expense"
        description={`This permanently deletes "${deletingExpense?.name}". This can't be undone.`}
        loading={deleteExpense.isPending}
        onConfirm={onConfirmDelete}
        onCancel={() => setDeletingExpense(null)}
      />
    </motion.div>
  );
}
