import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, CreditCard as CreditCardIcon, CheckCircle2, Loader2, Pencil, Trash2 } from "lucide-react";
import { useCreditCards, useRecordEmiPayment, useDeleteCreditCard, useDeleteEmi } from "../hooks/useCreditCards";
import { useHouseholdStore } from "../store/useHouseholdStore";
import { EmptyState } from "../components/EmptyState";
import { LoadingScreen } from "../components/LoadingScreen";
import { Badge } from "../components/Badge";
import { CreditCardFormModal } from "../components/CreditCardFormModal";
import { EmiFormModal } from "../components/EmiFormModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { PaymentProjection } from "../components/PaymentProjection";
import { formatCurrency } from "../lib/format";
import { estimateFinishMonth } from "../lib/projection";

export default function CreditCards() {
  const { data: cards, isLoading } = useCreditCards();
  const { members } = useHouseholdStore();
  const recordEmiPayment = useRecordEmiPayment();
  const deleteCard = useDeleteCreditCard();
  const deleteEmi = useDeleteEmi();
  const [cardFormOpen, setCardFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<any>(null);
  const [deletingCard, setDeletingCard] = useState<any>(null);
  const [emiCardId, setEmiCardId] = useState<string | null>(null);
  const [editingEmi, setEditingEmi] = useState<any>(null);
  const [deletingEmi, setDeletingEmi] = useState<any>(null);
  const [busyEmiId, setBusyEmiId] = useState<string | null>(null);

  if (isLoading) return <LoadingScreen label="Loading credit cards..." />;

  function ownerLabel(c: any) {
    if (c.is_shared) return "Shared";
    return members.find((m) => m.id === c.owner_member_id)?.displayName || "Unassigned";
  }

  async function markEmiPaid(emiId: string) {
    setBusyEmiId(emiId);
    try {
      await recordEmiPayment.mutateAsync(emiId);
    } finally {
      setBusyEmiId(null);
    }
  }

  async function onConfirmDeleteCard() {
    if (!deletingCard) return;
    await deleteCard.mutateAsync(deletingCard.id);
    setDeletingCard(null);
  }

  async function onConfirmDeleteEmi() {
    if (!deletingEmi) return;
    await deleteEmi.mutateAsync(deletingEmi.id);
    setDeletingEmi(null);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Credit Cards</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">EMI plans on your cards, and their combined monthly due.</p>
        </div>
        <button className="btn-primary" onClick={() => setCardFormOpen(true)}>
          <Plus size={16} />
          Add card
        </button>
      </div>

      {!cards || cards.length === 0 ? (
        <EmptyState
          icon={CreditCardIcon}
          title="No credit cards yet"
          description="Add a card to start tracking its EMI plans."
          action={
            <button className="btn-primary" onClick={() => setCardFormOpen(true)}>
              <Plus size={16} />
              Add card
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          <PaymentProjection
            title="Total EMI payments — next few months"
            items={cards.flatMap((c: any) =>
              (c.credit_card_emis || [])
                .filter((e: any) => e.status === "active")
                .map((e: any) => ({ amount: Number(e.monthly_amount), remainingPayments: Number(e.remaining_payments) }))
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {cards.map((c: any) => (
            <div key={c.id} className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-900 dark:text-white">{c.name}</p>
                  <Badge tone="brand">{ownerLabel(c)}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(c.monthly_due)}/mo</span>
                  <button onClick={() => setEditingCard(c)} className="btn-ghost !p-1.5" aria-label="Edit card">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeletingCard(c)} className="btn-ghost !p-1.5 hover:text-red-500" aria-label="Delete card">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {c.credit_card_emis?.length ? (
                <ul className="divide-y divide-surface-lightBorder dark:divide-surface-darkBorder">
                  {c.credit_card_emis.map((e: any) => {
                    const hasManualAmount = e.remaining_amount != null;
                    const remainingAmount = hasManualAmount
                      ? Number(e.remaining_amount)
                      : Number(e.monthly_amount) * Number(e.remaining_payments);
                    return (
                    <li key={e.id} className="flex items-center justify-between py-2.5">
                      <div>
                        <p className={`text-sm ${e.status === "completed" ? "text-slate-400 line-through" : "text-slate-900 dark:text-white"}`}>
                          {e.item_name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {e.status === "active" && (
                            <>
                              <span className="font-medium text-slate-700 dark:text-slate-200">{formatCurrency(remainingAmount)}</span>{" "}
                              remaining{!hasManualAmount && " (est.)"} ·{" "}
                            </>
                          )}
                          {formatCurrency(e.monthly_amount)}/mo · {e.remaining_payments} left
                          {e.status === "active" && <> · finishes {estimateFinishMonth(e.remaining_payments)}</>}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {e.status === "active" && (
                          <button
                            onClick={() => markEmiPaid(e.id)}
                            disabled={busyEmiId === e.id}
                            className="btn-secondary text-xs"
                          >
                            {busyEmiId === e.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                            Mark paid
                          </button>
                        )}
                        {e.status !== "active" && <Badge tone="emerald">Done</Badge>}
                        <button onClick={() => setEditingEmi(e)} className="btn-ghost !p-1.5" aria-label="Edit EMI">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setDeletingEmi(e)} className="btn-ghost !p-1.5 hover:text-red-500" aria-label="Delete EMI">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </li>
                  );})}
                </ul>
              ) : (
                <p className="py-3 text-sm text-slate-500 dark:text-slate-400">No EMIs on this card yet.</p>
              )}

              <button className="btn-ghost mt-2 w-full justify-center border border-dashed border-surface-lightBorder dark:border-surface-darkBorder" onClick={() => setEmiCardId(c.id)}>
                <Plus size={14} />
                Add EMI
              </button>
            </div>
          ))}
          </div>
        </div>
      )}

      <CreditCardFormModal open={cardFormOpen} onClose={() => setCardFormOpen(false)} />
      <CreditCardFormModal open={!!editingCard} card={editingCard} onClose={() => setEditingCard(null)} />
      <EmiFormModal cardId={emiCardId} onClose={() => setEmiCardId(null)} />
      <EmiFormModal cardId={null} emi={editingEmi} onClose={() => setEditingEmi(null)} />

      <ConfirmDialog
        open={!!deletingCard}
        title="Delete credit card"
        description={`This deletes "${deletingCard?.name}" and all of its EMI plans. This can't be undone.`}
        loading={deleteCard.isPending}
        onConfirm={onConfirmDeleteCard}
        onCancel={() => setDeletingCard(null)}
      />
      <ConfirmDialog
        open={!!deletingEmi}
        title="Delete EMI"
        description={`This deletes "${deletingEmi?.item_name}" from this card. This can't be undone.`}
        loading={deleteEmi.isPending}
        onConfirm={onConfirmDeleteEmi}
        onCancel={() => setDeletingEmi(null)}
      />
    </motion.div>
  );
}
