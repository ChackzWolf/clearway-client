import { useState } from "react";
import { Loader2, PartyPopper } from "lucide-react";
import { Modal } from "./Modal";
import { useAllocateFreedMoney } from "../hooks/useDashboard";
import { useBuckets } from "../hooks/useBuckets";
import { formatCurrency } from "../lib/format";

type Choice = "bucket" | "split" | "new_bucket" | "skip";

export function FreedMoneyModal({
  debt,
  onClose,
}: {
  debt: { id: string; name: string; monthly_payment: number } | null;
  onClose: () => void;
}) {
  const { data: buckets } = useBuckets();
  const allocate = useAllocateFreedMoney();
  const [choice, setChoice] = useState<Choice>("bucket");
  const [targetBucketId, setTargetBucketId] = useState("");
  const [newBucketName, setNewBucketName] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!debt) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await allocate.mutateAsync({
        debtId: debt!.id,
        choice,
        targetBucketId: choice === "bucket" ? targetBucketId : undefined,
        newBucketName: choice === "new_bucket" ? newBucketName : undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Could not allocate freed money");
    }
  }

  return (
    <Modal open={!!debt} onClose={onClose} title="Decide where this goes">
      <div className="mb-4 flex items-start gap-3 rounded-xl2 bg-emerald-500/10 p-4">
        <PartyPopper className="mt-0.5 shrink-0 text-emerald-500" size={20} />
        <p className="text-sm text-slate-700 dark:text-slate-200">
          <span className="font-semibold">{debt.name}</span> is paid off — {formatCurrency(debt.monthly_payment)}/month is
          now free. Where should it go?
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { id: "bucket", label: "Add to a bucket" },
              { id: "split", label: "Split across buckets" },
              { id: "new_bucket", label: "New bucket" },
              { id: "skip", label: "Skip for now" },
            ] as { id: Choice; label: string }[]
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setChoice(opt.id)}
              className={`rounded-xl2 border px-3 py-2.5 text-sm font-medium transition-colors ${
                choice === opt.id
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-surface-lightBorder text-slate-600 dark:border-surface-darkBorder dark:text-slate-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {choice === "bucket" && (
          <div>
            <label className="label">Bucket</label>
            <select className="input" required value={targetBucketId} onChange={(e) => setTargetBucketId(e.target.value)}>
              <option value="" disabled>
                Choose a bucket
              </option>
              {(buckets || []).map((b: any) => (
                <option key={b.id} value={b.id}>
                  {b.icon} {b.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {choice === "new_bucket" && (
          <div>
            <label className="label">New bucket name</label>
            <input className="input" required placeholder="e.g. Travel Fund" value={newBucketName} onChange={(e) => setNewBucketName(e.target.value)} />
          </div>
        )}

        {choice === "split" && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            The freed amount will be split evenly across every bucket you're eligible to contribute to.
          </p>
        )}

        {choice === "skip" && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            You can allocate this later — it just won't be tracked in a bucket yet.
          </p>
        )}

        {error && <p className="rounded-xl2 border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}

        <button type="submit" disabled={allocate.isPending} className="btn-primary w-full">
          {allocate.isPending && <Loader2 size={16} className="animate-spin" />}
          Confirm
        </button>
      </form>
    </Modal>
  );
}
