import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Landmark, CheckCircle2, XCircle, Loader2, Pencil, Trash2 } from "lucide-react";
import { useDebts, useRecordDebtPayment, useCloseDebtEarly, useDeleteDebt } from "../hooks/useDebts";
import { useHouseholdStore } from "../store/useHouseholdStore";
import { EmptyState } from "../components/EmptyState";
import { LoadingScreen } from "../components/LoadingScreen";
import { Badge } from "../components/Badge";
import { ProgressBar } from "../components/ProgressBar";
import { DebtFormModal } from "../components/DebtFormModal";
import { FreedMoneyModal } from "../components/FreedMoneyModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { PaymentProjection } from "../components/PaymentProjection";
import { formatCurrency, formatDate } from "../lib/format";
import { estimateFinishMonth } from "../lib/projection";

const RULE_LABEL: Record<string, string> = {
  fixed_schedule: "Fixed schedule",
  pay_extra_anytime: "Pay extra anytime",
  close_anytime: "Close anytime",
};

export default function Debts() {
  const { data: debts, isLoading } = useDebts();
  const { members } = useHouseholdStore();
  const recordPayment = useRecordDebtPayment();
  const closeEarly = useCloseDebtEarly();
  const deleteDebt = useDeleteDebt();
  const [formOpen, setFormOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<any>(null);
  const [deletingDebt, setDeletingDebt] = useState<any>(null);
  const [freedDebt, setFreedDebt] = useState<any>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  if (isLoading) return <LoadingScreen label="Loading debts..." />;

  const active = (debts || []).filter((d: any) => d.status === "active");
  const completed = (debts || []).filter((d: any) => d.status === "completed");

  function ownerLabel(d: any) {
    if (d.is_shared) return "Shared";
    return members.find((m) => m.id === d.owner_member_id)?.displayName || "Unassigned";
  }

  async function markPaid(debt: any) {
    setBusyId(debt.id);
    try {
      const res = await recordPayment.mutateAsync({ debtId: debt.id, status: "paid" });
      if (res.freedMoneyAvailable) setFreedDebt(res.debt);
    } finally {
      setBusyId(null);
    }
  }

  async function onCloseEarly(debt: any) {
    setBusyId(debt.id);
    try {
      const res = await closeEarly.mutateAsync(debt.id);
      if (res.freedMoneyAvailable) setFreedDebt(res.debt);
    } finally {
      setBusyId(null);
    }
  }

  async function onConfirmDelete() {
    if (!deletingDebt) return;
    await deleteDebt.mutateAsync(deletingDebt.id);
    setDeletingDebt(null);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Debts</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">EMIs and loans, tracked without accounting jargon.</p>
        </div>
        <button className="btn-primary" onClick={() => setFormOpen(true)}>
          <Plus size={16} />
          Add debt
        </button>
      </div>

      {active.length === 0 && completed.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="No debts yet"
          description="Add your first loan or EMI to start tracking payoff."
          action={
            <button className="btn-primary" onClick={() => setFormOpen(true)}>
              <Plus size={16} />
              Add debt
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          <PaymentProjection
            title="Total debt payments — next few months"
            items={active.map((d: any) => ({ amount: Number(d.monthly_payment), remainingPayments: Number(d.remaining_payments) }))}
          />

          {active.map((d: any) => {
            const totalKnown = d.remaining_payments > 0 ? d.remaining_payments : 1;
            const pctDone = Math.max(0, 100 - (d.remaining_payments / totalKnown) * 100);
            const hasManualAmount = d.remaining_amount != null;
            const remainingAmount = hasManualAmount ? Number(d.remaining_amount) : Number(d.monthly_payment) * Number(d.remaining_payments);
            return (
              <div key={d.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900 dark:text-white">{d.name}</p>
                      <Badge>{d.category}</Badge>
                      <Badge tone="brand">{ownerLabel(d)}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(remainingAmount)}</span>{" "}
                      remaining{!hasManualAmount && " (est.)"} · {formatCurrency(d.monthly_payment)}/month · {d.remaining_payments} payment
                      {d.remaining_payments === 1 ? "" : "s"} left · {RULE_LABEL[d.payment_rule]}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                      {d.next_due_date && <>Next due {formatDate(d.next_due_date)} · </>}
                      Finishes around {estimateFinishMonth(d.remaining_payments, d.next_due_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingDebt(d)} className="btn-ghost !p-2" aria-label="Edit debt">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setDeletingDebt(d)} className="btn-ghost !p-2 hover:text-red-500" aria-label="Delete debt">
                      <Trash2 size={15} />
                    </button>
                    {d.payment_rule === "close_anytime" && (
                      <button
                        onClick={() => onCloseEarly(d)}
                        disabled={busyId === d.id}
                        className="btn-secondary text-sm"
                      >
                        {busyId === d.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                        Close early{d.foreclosure_amount != null && ` (${formatCurrency(d.foreclosure_amount)})`}
                      </button>
                    )}
                    <button onClick={() => markPaid(d)} disabled={busyId === d.id} className="btn-primary text-sm">
                      {busyId === d.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                      Mark paid
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <ProgressBar value={pctDone} />
                </div>
              </div>
            );
          })}

          {completed.length > 0 && (
            <div className="pt-4">
              <p className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">Paid off</p>
              <div className="space-y-2">
                {completed.map((d: any) => (
                  <div key={d.id} className="card flex items-center justify-between p-4 opacity-70">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{d.name}</span>
                      <Badge>{d.category}</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {formatCurrency(d.monthly_payment)}/month freed
                        {!d.freed_amount_allocated && (
                          <button className="ml-3 font-medium text-brand hover:underline" onClick={() => setFreedDebt(d)}>
                            Allocate
                          </button>
                        )}
                      </span>
                      <button onClick={() => setDeletingDebt(d)} className="btn-ghost !p-1.5 hover:text-red-500" aria-label="Delete debt">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <DebtFormModal open={formOpen} onClose={() => setFormOpen(false)} />
      <DebtFormModal open={!!editingDebt} debt={editingDebt} onClose={() => setEditingDebt(null)} />
      <ConfirmDialog
        open={!!deletingDebt}
        title="Delete debt"
        description={`This permanently deletes "${deletingDebt?.name}" and its payment history. This can't be undone.`}
        loading={deleteDebt.isPending}
        onConfirm={onConfirmDelete}
        onCancel={() => setDeletingDebt(null)}
      />
      <FreedMoneyModal debt={freedDebt} onClose={() => setFreedDebt(null)} />
    </motion.div>
  );
}
