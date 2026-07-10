import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, PiggyBank } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { useBuckets, useDeleteBucket, useReorderBuckets } from "../hooks/useBuckets";
import { useHouseholdStore } from "../store/useHouseholdStore";
import { EmptyState } from "../components/EmptyState";
import { LoadingScreen } from "../components/LoadingScreen";
import { BucketFormModal } from "../components/BucketFormModal";
import { ContributeModal } from "../components/ContributeModal";
import { BucketLinksModal } from "../components/BucketLinksModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { BucketCard } from "../components/BucketCard";

export default function Buckets() {
  const { data: buckets, isLoading } = useBuckets();
  const { members } = useHouseholdStore();
  const deleteBucket = useDeleteBucket();
  const reorderBuckets = useReorderBuckets();
  const [formOpen, setFormOpen] = useState(false);
  const [editingBucket, setEditingBucket] = useState<any>(null);
  const [deletingBucket, setDeletingBucket] = useState<any>(null);
  const [contributingBucket, setContributingBucket] = useState<any>(null);
  const [linksBucket, setLinksBucket] = useState<any>(null);
  const [orderedBuckets, setOrderedBuckets] = useState<any[]>([]);

  // A short drag threshold so a plain click on the handle (or a tap on
  // mobile) doesn't get misread as an accidental drag.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    if (buckets) setOrderedBuckets(buckets);
  }, [buckets]);

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

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedBuckets.findIndex((b) => b.id === active.id);
    const newIndex = orderedBuckets.findIndex((b) => b.id === over.id);
    const next = arrayMove(orderedBuckets, oldIndex, newIndex);
    setOrderedBuckets(next); // optimistic — reorder feels instant
    reorderBuckets.mutate(next.map((b) => b.id));
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Buckets</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Goal-based savings and wishlist items — drag the handle to arrange by your own priority.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setFormOpen(true)}>
          <Plus size={16} />
          New bucket
        </button>
      </div>

      {orderedBuckets.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="No buckets yet"
          description="Create a savings goal, or just something you want to buy someday."
          action={
            <button className="btn-primary" onClick={() => setFormOpen(true)}>
              <Plus size={16} />
              New bucket
            </button>
          }
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={orderedBuckets.map((b) => b.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {orderedBuckets.map((b: any) => (
                <BucketCard
                  key={b.id}
                  bucket={b}
                  ownerLabel={ownerLabel(b)}
                  onEdit={() => setEditingBucket(b)}
                  onDelete={() => setDeletingBucket(b)}
                  onLinks={() => setLinksBucket(b)}
                  onContribute={() => setContributingBucket(b)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
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
