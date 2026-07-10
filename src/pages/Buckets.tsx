import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, PiggyBank, Pencil, Trash2, Wallet, Link2 } from "lucide-react";
import { useBuckets, useDeleteBucket } from "../hooks/useBuckets";
import { useHouseholdStore } from "../store/useHouseholdStore";
import { EmptyState } from "../components/EmptyState";
import { LoadingScreen } from "../components/LoadingScreen";
import { Badge } from "../components/Badge";
import { ProgressBar } from "../components/ProgressBar";
import { BucketFormModal } from "../components/BucketFormModal";
import { ContributeModal } from "../components/ContributeModal";
import { BucketLinksModal } from "../components/BucketLinksModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { formatCurrency, formatDate } from "../lib/format";

const PRIORITY_TONE: Record<string, "red" | "amber" | "slate"> = { High: "red", Medium: "amber", Low: "slate" };

export default function Buckets() {
  const { data: buckets, isLoading } = useBuckets();
  const { members } = useHouseholdStore();
  const deleteBucket = useDeleteBucket();
  const [formOpen, setFormOpen] = useState(false);
  const [editingBucket, setEditingBucket] = useState<any>(null);
  const [deletingBucket, setDeletingBucket] = useState<any>(null);
  const [contributingBucket, setContributingBucket] = useState<any>(null);
  const [linksBucket, setLinksBucket] = useState<any>(null);

  if (isLoading) return <LoadingScreen label="Loading buckets..." />;

  // Look up the live bucket by id rather than holding onto the snapshot from
  // the click event, so the links modal reflects newly added/removed links
  // immediately after the list refetches.
  const activeLinksBucket = linksBucket ? buckets?.find((b: any) => b.id === linksBucket.id) ?? linksBucket : null;

  function ownerLabel(b: any) {
    if (b.is_shared) return "Shared";
    return members.find((m) => m.id === b.owner_member_id)?.displayName || "Unassigned";
  }

  async function onConfirmDelete() {
    if (!deletingBucket) return;
    await deleteBucket.mutateAsync(deletingBucket.id);
    setDeletingBucket(null);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Buckets</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Goal-based savings — not bank accounts, just targets.</p>
        </div>
        <button className="btn-primary" onClick={() => setFormOpen(true)}>
          <Plus size={16} />
          New bucket
        </button>
      </div>

      {!buckets || buckets.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="No buckets yet"
          description="Create a savings goal — an emergency fund, a trip, anything."
          action={
            <button className="btn-primary" onClick={() => setFormOpen(true)}>
              <Plus size={16} />
              New bucket
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {buckets.map((b: any) => {
            const pct = Number(b.target_amount) > 0 ? (Number(b.current_amount) / Number(b.target_amount)) * 100 : 0;
            return (
              <div key={b.id} className="card overflow-hidden p-5">
                {b.image_url && (
                  <img src={b.image_url} alt="" className="-mx-5 -mt-5 mb-4 h-32 w-[calc(100%+2.5rem)] object-cover" />
                )}
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{b.icon}</span>
                    <p className="font-medium text-slate-900 dark:text-white">{b.name}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {b.is_completed && <Badge tone="emerald">Done</Badge>}
                    <button onClick={() => setLinksBucket(b)} className="btn-ghost !p-1.5" aria-label="Manage links">
                      <Link2 size={13} />
                      {b.bucket_links?.length > 0 && <span className="ml-0.5 text-xs">{b.bucket_links.length}</span>}
                    </button>
                    <button onClick={() => setEditingBucket(b)} className="btn-ghost !p-1.5" aria-label="Edit bucket">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => setDeletingBucket(b)} className="btn-ghost !p-1.5 hover:text-red-500" aria-label="Delete bucket">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    {formatCurrency(b.current_amount)} / {formatCurrency(b.target_amount)}
                  </span>
                  <span>{Math.round(pct)}%</span>
                </div>
                <ProgressBar value={pct} tone="emerald" />

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge tone={PRIORITY_TONE[b.priority]}>{b.priority}</Badge>
                  <Badge tone="brand">{ownerLabel(b)}</Badge>
                  {b.monthly_contribution > 0 && <Badge>{formatCurrency(b.monthly_contribution)}/mo</Badge>}
                </div>

                {b.deadline && <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Target date: {formatDate(b.deadline)}</p>}

                <button
                  className="btn-secondary mt-3 w-full justify-center text-sm"
                  onClick={() => setContributingBucket(b)}
                  disabled={b.is_completed}
                >
                  <Wallet size={14} />
                  Add money
                </button>
              </div>
            );
          })}
        </div>
      )}

      <BucketFormModal open={formOpen} onClose={() => setFormOpen(false)} />
      <BucketFormModal open={!!editingBucket} bucket={editingBucket} onClose={() => setEditingBucket(null)} />
      <ContributeModal bucket={contributingBucket} onClose={() => setContributingBucket(null)} />
      <BucketLinksModal bucket={activeLinksBucket} onClose={() => setLinksBucket(null)} />
      <ConfirmDialog
        open={!!deletingBucket}
        title="Delete bucket"
        description={`This permanently deletes "${deletingBucket?.name}" and its contribution history. This can't be undone.`}
        loading={deleteBucket.isPending}
        onConfirm={onConfirmDelete}
        onCancel={() => setDeletingBucket(null)}
      />
    </motion.div>
  );
}
