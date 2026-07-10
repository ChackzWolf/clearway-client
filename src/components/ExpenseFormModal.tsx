import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "./Modal";
import { OwnerField } from "./OwnerField";
import { DatePicker } from "./DatePicker";
import { useCreateExpense, useUpdateExpense } from "../hooks/useExpenses";

const ICONS = ["🔁", "📺", "🎮", "📱", "🌐", "🏋️", "💡", "🎵"];
const CATEGORIES = ["Subscription", "Recharge", "Utility", "Membership", "Other"];
const CYCLE_PRESETS = [
  { label: "Monthly", months: 1 },
  { label: "Every 2 months", months: 2 },
  { label: "Quarterly", months: 3 },
  { label: "Every 6 months", months: 6 },
  { label: "Yearly", months: 12 },
];

const EMPTY_FORM = {
  name: "",
  category: CATEGORIES[0],
  icon: ICONS[0],
  amount: "",
  billingCycleMonths: "1",
  customCycle: false,
  nextDueDate: "",
  isShared: true,
  ownerMemberId: null as string | null,
  notes: "",
};

export function ExpenseFormModal({ open, onClose, expense }: { open: boolean; onClose: () => void; expense?: any | null }) {
  const isEdit = !!expense;
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (expense) {
      const isPreset = CYCLE_PRESETS.some((p) => p.months === expense.billing_cycle_months);
      setForm({
        name: expense.name,
        category: expense.category,
        icon: expense.icon || ICONS[0],
        amount: String(expense.amount),
        billingCycleMonths: String(expense.billing_cycle_months),
        customCycle: !isPreset,
        nextDueDate: expense.next_due_date || "",
        isShared: expense.is_shared,
        ownerMemberId: expense.owner_member_id,
        notes: expense.notes || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError(null);
  }, [open, expense]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      name: form.name,
      category: form.category,
      icon: form.icon,
      amount: Number(form.amount),
      billingCycleMonths: Number(form.billingCycleMonths),
      nextDueDate: form.nextDueDate || null,
      isShared: form.isShared,
      ownerMemberId: form.isShared ? null : form.ownerMemberId,
      notes: form.notes || null,
    };
    try {
      if (isEdit) {
        await updateExpense.mutateAsync({ expenseId: expense.id, payload });
      } else {
        await createExpense.mutateAsync(payload);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || `Could not ${isEdit ? "update" : "add"} expense`);
    }
  }

  const pending = createExpense.isPending || updateExpense.isPending;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit expense" : "Add a recurring expense"}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Name</label>
          <input className="input" required placeholder="e.g. Netflix" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>

        <div>
          <label className="label">Icon</label>
          <div className="flex flex-wrap gap-2">
            {ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setForm({ ...form, icon })}
                className={`flex h-10 w-10 items-center justify-center rounded-xl2 border text-lg ${
                  form.icon === icon ? "border-brand bg-brand/10" : "border-surface-lightBorder dark:border-surface-darkBorder"
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
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
            <label className="label">Amount (₹)</label>
            <input className="input" type="number" min={1} required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="label">Billing cycle</label>
          <div className="grid grid-cols-3 gap-2">
            {CYCLE_PRESETS.map((p) => (
              <button
                key={p.months}
                type="button"
                onClick={() => setForm({ ...form, billingCycleMonths: String(p.months), customCycle: false })}
                className={`rounded-xl2 border px-2 py-2 text-xs font-medium transition-colors ${
                  !form.customCycle && Number(form.billingCycleMonths) === p.months
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-surface-lightBorder text-slate-600 dark:border-surface-darkBorder dark:text-slate-300"
                }`}
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  customCycle: true,
                  // Clear the value if it was just a preset's number, so the
                  // placeholder is visible and you're not left staring at a
                  // stray "1" wondering what it means.
                  billingCycleMonths: CYCLE_PRESETS.some((p) => String(p.months) === f.billingCycleMonths) ? "" : f.billingCycleMonths,
                }))
              }
              className={`rounded-xl2 border px-2 py-2 text-xs font-medium transition-colors ${
                form.customCycle ? "border-brand bg-brand/10 text-brand" : "border-surface-lightBorder text-slate-600 dark:border-surface-darkBorder dark:text-slate-300"
              }`}
            >
              Custom
            </button>
          </div>
          {form.customCycle && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-300">Charges every</span>
              <input
                className="input w-20 text-center"
                type="number"
                min={1}
                max={60}
                required
                autoFocus
                placeholder="4"
                value={form.billingCycleMonths}
                onChange={(e) => setForm({ ...form, billingCycleMonths: e.target.value })}
              />
              <span className="text-sm text-slate-600 dark:text-slate-300">
                month{Number(form.billingCycleMonths) === 1 ? "" : "s"}
              </span>
            </div>
          )}
        </div>

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
          {isEdit ? "Save changes" : "Add expense"}
        </button>
      </form>
    </Modal>
  );
}
