import { useState } from "react";
import { Loader2, PiggyBank } from "lucide-react";
import { Modal } from "./Modal";
import { useContributeBucket } from "../hooks/useBuckets";
import { formatCurrency } from "../lib/format";

export function ContributeModal({ bucket, onClose }: { bucket: any | null; onClose: () => void }) {
  const contribute = useContributeBucket();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!bucket) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await contribute.mutateAsync({ bucketId: bucket!.id, amount: Number(amount) });
      setAmount("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Could not add contribution");
    }
  }

  return (
    <Modal open={!!bucket} onClose={onClose} title={`Add money to ${bucket.name}`}>
      <div className="mb-4 flex items-center gap-3 rounded-xl2 bg-brand/5 p-4">
        <PiggyBank className="shrink-0 text-brand" size={20} />
        <p className="text-sm text-slate-700 dark:text-slate-200">
          Currently at {formatCurrency(bucket.current_amount)} of {formatCurrency(bucket.target_amount)}.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Amount (₹)</label>
          <input className="input" type="number" min={1} required autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        {error && <p className="rounded-xl2 border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={contribute.isPending} className="btn-primary w-full">
          {contribute.isPending && <Loader2 size={16} className="animate-spin" />}
          Add money
        </button>
      </form>
    </Modal>
  );
}
