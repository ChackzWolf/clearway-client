import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "./Modal";
import { OwnerField } from "./OwnerField";
import { DatePicker } from "./DatePicker";
import { useCreateDebt, useUpdateDebt } from "../hooks/useDebts";
import { formatCurrency } from "../lib/format";

const CATEGORIES = ["Home Loan", "Vehicle Loan", "Personal Loan", "Bike Loan", "Gold Loan", "Education Loan", "Phone Finance", "Other"];
const PAYMENT_RULES = [
  { value: "fixed_schedule", label: "Fixed schedule" },
  { value: "pay_extra_anytime", label: "Pay extra anytime" },
  { value: "close_anytime", label: "Close anytime" },
];

const EMPTY_FORM = {
  name: "",
  category: CATEGORIES[0],
  monthlyPayment: "",
  remainingPayments: "",
  remainingAmount: "",
  foreclosureAmount: "",
  nextDueDate: "",
  paymentRule: "fixed_schedule",
  notes: "",
  isShared: true,
  ownerMemberId: null as string | null,
};

export function DebtFormModal({ open, onClose, debt }: { open: boolean; onClose: () => void; debt?: any | null }) {
  const isEdit = !!debt;
  const createDebt = useCreateDebt();
  const updateDebt = useUpdateDebt();
  const [form, setForm] = useState(EMPTY_FORM);
  const [amountMode, setAmountMode] = useState<"auto" | "manual">("auto");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (debt) {
      setForm({
        name: debt.name,
        category: debt.category,
        monthlyPayment: String(debt.monthly_payment),
        remainingPayments: String(debt.remaining_payments),
        remainingAmount: debt.remaining_amount != null ? String(debt.remaining_amount) : "",
        foreclosureAmount: debt.foreclosure_amount != null ? String(debt.foreclosure_amount) : "",
        nextDueDate: debt.next_due_date || "",
        paymentRule: debt.payment_rule,
        notes: debt.notes || "",
        isShared: debt.is_shared,
        ownerMemberId: debt.owner_member_id,
      });
      setAmountMode(debt.remaining_amount != null ? "manual" : "auto");
    } else {
      setForm(EMPTY_FORM);
      setAmountMode("auto");
    }
    setError(null);
  }, [open, debt]);

  const autoAmount = Number(form.monthlyPayment || 0) * Number(form.remainingPayments || 0);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      name: form.name,
      category: form.category,
      monthlyPayment: Number(form.monthlyPayment),
      remainingPayments: Number(form.remainingPayments),
      remainingAmount: amountMode === "manual" && form.remainingAmount ? Number(form.remainingAmount) : null,
      foreclosureAmount: form.foreclosureAmount ? Number(form.foreclosureAmount) : null,
      nextDueDate: form.nextDueDate || null,
      paymentRule: form.paymentRule,
      notes: form.notes || null,
      isShared: form.isShared,
      ownerMemberId: form.isShared ? null : form.ownerMemberId,
    };
    try {
      if (isEdit) {
        await updateDebt.mutateAsync({ debtId: debt.id, payload });
      } else {
        await createDebt.mutateAsync(payload);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || `Could not ${isEdit ? "update" : "add"} debt`);
    }
  }

  const pending = createDebt.isPending || updateDebt.isPending;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit debt" : "Add a debt"}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Name</label>
          <input className="input" required placeholder="e.g. Car loan" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Payment rule</label>
            <select className="input" value={form.paymentRule} onChange={(e) => setForm({ ...form, paymentRule: e.target.value })}>
              {PAYMENT_RULES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Monthly payment (₹)</label>
            <input className="input" type="number" min={1} required value={form.monthlyPayment} onChange={(e) => setForm({ ...form, monthlyPayment: e.target.value })} />
          </div>
          <div>
            <label className="label">Months left to pay</label>
            <input className="input" type="number" min={0} required placeholder="e.g. 12" value={form.remainingPayments} onChange={(e) => setForm({ ...form, remainingPayments: e.target.value })} />
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
              ≈ {formatCurrency(autoAmount)} <span className="text-slate-400 dark:text-slate-500">(monthly payment × months left)</span>
            </p>
          ) : (
            <input
              className="input"
              type="number"
              min={0}
              placeholder="e.g. 65000"
              value={form.remainingAmount}
              onChange={(e) => setForm({ ...form, remainingAmount: e.target.value })}
            />
          )}
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {amountMode === "auto"
              ? "Recalculated automatically from monthly payment × months left."
              : "Decreases by your monthly payment each time you mark a month paid."}
          </p>
        </div>

        {form.paymentRule === "close_anytime" && (
          <div>
            <label className="label">Foreclosure amount (₹) (optional)</label>
            <input
              className="input"
              type="number"
              min={0}
              placeholder="e.g. 58000"
              value={form.foreclosureAmount}
              onChange={(e) => setForm({ ...form, foreclosureAmount: e.target.value })}
            />
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              The lump sum to close this loan early, if your lender quotes one. Also decreases each month paid.
            </p>
          </div>
        )}

        <div>
          <label className="label">Next due date (optional)</label>
          <DatePicker value={form.nextDueDate} onChange={(v) => setForm({ ...form, nextDueDate: v })} />
        </div>

        <OwnerField
          isShared={form.isShared}
          ownerMemberId={form.ownerMemberId}
          onChange={({ isShared, ownerMemberId }) => setForm({ ...form, isShared, ownerMemberId })}
        />

        <div>
          <label className="label">Notes (optional)</label>
          <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        {error && <p className="rounded-xl2 border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}

        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending && <Loader2 size={16} className="animate-spin" />}
          {isEdit ? "Save changes" : "Add debt"}
        </button>
      </form>
    </Modal>
  );
}
