import { useEffect, useRef, useState } from "react";
import { Loader2, ImagePlus, X, Sparkles } from "lucide-react";
import { Modal } from "./Modal";
import { OwnerField } from "./OwnerField";
import { DatePicker } from "./DatePicker";
import { useCreateBucket, useUpdateBucket } from "../hooks/useBuckets";
import { useHouseholdStore } from "../store/useHouseholdStore";
import { uploadBucketImage } from "../services/supabaseClient";
import { formatCurrency } from "../lib/format";
import { parseDateOnly, toDateOnlyString, formatDateOnlyDisplay, addMonths, monthsBetween } from "../lib/date";

const ICONS = ["🎯", "🏖️", "🚑", "🏠", "🎓", "💍", "🚗", "🎁"];

const EMPTY_FORM = {
  name: "",
  icon: ICONS[0],
  imageUrl: "",
  targetAmount: "",
  monthlyContribution: "",
  priority: "Medium",
  deadline: "",
  isShared: true,
  ownerMemberId: null as string | null,
};

export function BucketFormModal({ open, onClose, bucket }: { open: boolean; onClose: () => void; bucket?: any | null }) {
  const isEdit = !!bucket;
  const householdId = useHouseholdStore((s) => s.householdId);
  const createBucket = useCreateBucket();
  const updateBucket = useUpdateBucket();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (bucket) {
      setForm({
        name: bucket.name,
        icon: bucket.icon,
        imageUrl: bucket.image_url || "",
        targetAmount: String(bucket.target_amount),
        monthlyContribution: String(bucket.monthly_contribution || 0),
        priority: bucket.priority,
        deadline: bucket.deadline || "",
        isShared: bucket.is_shared,
        ownerMemberId: bucket.owner_member_id,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError(null);
  }, [open, bucket]);

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadBucketImage(file, householdId!);
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch (err: any) {
      setError(err.message || "Could not upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      name: form.name,
      icon: form.icon,
      imageUrl: form.imageUrl || null,
      targetAmount: Number(form.targetAmount),
      monthlyContribution: form.monthlyContribution ? Number(form.monthlyContribution) : 0,
      priority: form.priority,
      deadline: form.deadline || null,
      isShared: form.isShared,
      ownerMemberId: form.isShared ? null : form.ownerMemberId,
    };
    try {
      if (isEdit) {
        await updateBucket.mutateAsync({ bucketId: bucket.id, payload });
      } else {
        await createBucket.mutateAsync(payload);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || `Could not ${isEdit ? "update" : "add"} bucket`);
    }
  }

  const pending = createBucket.isPending || updateBucket.isPending;

  // Bidirectional target/deadline/monthly calculator: whichever two of the
  // three you fill in, the third is suggested here (never force-overwritten —
  // you apply it with one click, or ignore it and keep typing your own numbers).
  const currentAmount = bucket ? Number(bucket.current_amount || 0) : 0;
  const target = Number(form.targetAmount || 0);
  const remaining = Math.max(target - currentAmount, 0);

  const deadlineHint =
    form.deadline && target > 0
      ? (() => {
          const months = monthsBetween(new Date(), parseDateOnly(form.deadline));
          return { months, suggestedMonthly: Math.ceil(remaining / months) };
        })()
      : null;

  const monthlyValue = Number(form.monthlyContribution || 0);
  const monthlyHint =
    monthlyValue > 0 && target > 0
      ? (() => {
          const monthsNeeded = Math.ceil(remaining / monthlyValue);
          return { monthsNeeded, finishDate: addMonths(new Date(), monthsNeeded) };
        })()
      : null;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit bucket" : "New savings bucket"}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Name</label>
          <input className="input" required placeholder="e.g. Emergency Fund" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
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

        <div>
          <label className="label">Photo (optional)</label>
          <p className="mb-2 text-xs text-slate-400 dark:text-slate-500">
            For goals you'd rather picture than link — e.g. a bike you saw in person.
          </p>
          {form.imageUrl ? (
            <div className="relative h-32 w-full overflow-hidden rounded-xl2 border border-surface-lightBorder dark:border-surface-darkBorder">
              <img src={form.imageUrl} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setForm({ ...form, imageUrl: "" })}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                aria-label="Remove image"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-secondary w-full justify-center border-dashed"
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
              {uploading ? "Uploading..." : "Add a photo"}
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Target amount (₹)</label>
            <input className="input" type="number" min={1} required value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} />
          </div>
          <div>
            <label className="label">Monthly contribution (₹)</label>
            <input className="input" type="number" min={0} value={form.monthlyContribution} onChange={(e) => setForm({ ...form, monthlyContribution: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Priority</label>
            <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
          <div>
            <label className="label">Deadline (optional)</label>
            <DatePicker value={form.deadline} onChange={(v) => setForm({ ...form, deadline: v })} />
          </div>
        </div>

        {deadlineHint && (
          <div className="flex flex-col gap-2 rounded-xl2 bg-brand/5 px-3.5 py-2.5 text-xs text-slate-600 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-start gap-1.5">
              <Sparkles size={13} className="mt-0.5 shrink-0 text-brand" />
              To hit this by {formatDateOnlyDisplay(form.deadline)}, save ≈ {formatCurrency(deadlineHint.suggestedMonthly)}/month ({deadlineHint.months}{" "}
              mo left)
            </span>
            <button
              type="button"
              className="shrink-0 self-start font-medium text-brand hover:underline sm:self-auto"
              onClick={() => setForm((f) => ({ ...f, monthlyContribution: String(deadlineHint.suggestedMonthly) }))}
            >
              Use this
            </button>
          </div>
        )}

        {monthlyHint && (
          <div className="flex flex-col gap-2 rounded-xl2 bg-emerald-500/5 px-3.5 py-2.5 text-xs text-slate-600 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-start gap-1.5">
              <Sparkles size={13} className="mt-0.5 shrink-0 text-emerald-500" />
              At {formatCurrency(monthlyValue)}/month, you'll reach this around{" "}
              {monthlyHint.finishDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" })} ({monthlyHint.monthsNeeded} mo)
            </span>
            <button
              type="button"
              className="shrink-0 self-start font-medium text-emerald-600 hover:underline dark:text-emerald-400 sm:self-auto"
              onClick={() => setForm((f) => ({ ...f, deadline: toDateOnlyString(monthlyHint.finishDate) }))}
            >
              Set as deadline
            </button>
          </div>
        )}

        <OwnerField
          isShared={form.isShared}
          ownerMemberId={form.ownerMemberId}
          onChange={({ isShared, ownerMemberId }) => setForm({ ...form, isShared, ownerMemberId })}
        />

        {error && <p className="rounded-xl2 border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}

        <button type="submit" disabled={pending || uploading} className="btn-primary w-full">
          {pending && <Loader2 size={16} className="animate-spin" />}
          {isEdit ? "Save changes" : "Create bucket"}
        </button>
      </form>
    </Modal>
  );
}
