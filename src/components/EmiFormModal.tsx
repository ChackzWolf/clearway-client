import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "./Modal";
import { useAddEmi, useUpdateEmi } from "../hooks/useCreditCards";
import { formatCurrency } from "../lib/format";

export function EmiFormModal({ cardId, emi, onClose }: { cardId: string | null; emi?: any | null; onClose: () => void }) {
  const isEdit = !!emi;
  const addEmi = useAddEmi();
  const updateEmi = useUpdateEmi();
  const [itemName, setItemName] = useState("");
  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [remainingPayments, setRemainingPayments] = useState("");
  const [remainingAmount, setRemainingAmount] = useState("");
  const [amountMode, setAmountMode] = useState<"auto" | "manual">("auto");
  const [error, setError] = useState<string | null>(null);

  const open = !!cardId || !!emi;

  useEffect(() => {
    if (!open) return;
    if (emi) {
      setItemName(emi.item_name);
      setMonthlyAmount(String(emi.monthly_amount));
      setRemainingPayments(String(emi.remaining_payments));
      setRemainingAmount(emi.remaining_amount != null ? String(emi.remaining_amount) : "");
      setAmountMode(emi.remaining_amount != null ? "manual" : "auto");
    } else {
      setItemName("");
      setMonthlyAmount("");
      setRemainingPayments("");
      setRemainingAmount("");
      setAmountMode("auto");
    }
    setError(null);
  }, [open, emi]);

  const autoAmount = Number(monthlyAmount || 0) * Number(remainingPayments || 0);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const shared = {
      itemName,
      monthlyAmount: Number(monthlyAmount),
      remainingPayments: Number(remainingPayments),
      remainingAmount: amountMode === "manual" && remainingAmount ? Number(remainingAmount) : null,
    };
    try {
      if (isEdit) {
        await updateEmi.mutateAsync({ emiId: emi.id, payload: shared });
      } else {
        await addEmi.mutateAsync({ cardId: cardId!, ...shared });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || `Could not ${isEdit ? "update" : "add"} EMI`);
    }
  }

  const pending = addEmi.isPending || updateEmi.isPending;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit EMI" : "Add an EMI plan"}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">What did you buy?</label>
          <input className="input" required placeholder="e.g. Laptop" value={itemName} onChange={(e) => setItemName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Monthly amount (₹)</label>
            <input className="input" type="number" min={1} required value={monthlyAmount} onChange={(e) => setMonthlyAmount(e.target.value)} />
          </div>
          <div>
            <label className="label">Months left to pay</label>
            <input className="input" type="number" min={0} required placeholder="e.g. 6" value={remainingPayments} onChange={(e) => setRemainingPayments(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Remaining amount</label>
          <div className="mb-2 flex gap-2">
            <button
              type="button"
              onClick={() => setAmountMode("auto")}
              className={`flex-1 rounded-xl2 border px-3 py-2 text-sm font-medium transition-colors ${
                amountMode === "auto" ? "border-brand bg-brand/10 text-brand" : "border-surface-lightBorder text-slate-600 dark:border-surface-darkBorder dark:text-slate-300"
              }`}
            >
              Auto-calculate
            </button>
            <button
              type="button"
              onClick={() => setAmountMode("manual")}
              className={`flex-1 rounded-xl2 border px-3 py-2 text-sm font-medium transition-colors ${
                amountMode === "manual" ? "border-brand bg-brand/10 text-brand" : "border-surface-lightBorder text-slate-600 dark:border-surface-darkBorder dark:text-slate-300"
              }`}
            >
              Set manually
            </button>
          </div>

          {amountMode === "auto" ? (
            <p className="rounded-xl2 border border-surface-lightBorder bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600 dark:border-surface-darkBorder dark:bg-white/5 dark:text-slate-300">
              ≈ {formatCurrency(autoAmount)} <span className="text-slate-400 dark:text-slate-500">(monthly amount × months left)</span>
            </p>
          ) : (
            <input
              className="input"
              type="number"
              min={0}
              placeholder="e.g. 12000"
              value={remainingAmount}
              onChange={(e) => setRemainingAmount(e.target.value)}
            />
          )}
        </div>

        {error && <p className="rounded-xl2 border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending && <Loader2 size={16} className="animate-spin" />}
          {isEdit ? "Save changes" : "Add EMI"}
        </button>
      </form>
    </Modal>
  );
}
