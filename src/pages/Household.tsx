import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Users, Pencil, Trash2 } from "lucide-react";
import { useHouseholdStore } from "../store/useHouseholdStore";
import { useDeleteMember } from "../hooks/useMembers";
import { MemberFormModal } from "../components/MemberFormModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { formatCurrency } from "../lib/format";

export default function Household() {
  const members = useHouseholdStore((s) => s.members);
  const deleteMember = useDeleteMember();
  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [deletingMember, setDeletingMember] = useState<any>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function onConfirmDelete() {
    if (!deletingMember) return;
    setDeleteError(null);
    try {
      await deleteMember.mutateAsync(deletingMember.id);
      setDeletingMember(null);
    } catch (err: any) {
      setDeleteError(err.message || "Could not remove member");
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Household</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Who's sharing this household, and their income.</p>
        </div>
        <button className="btn-primary" onClick={() => setFormOpen(true)}>
          <Plus size={16} />
          Add member
        </button>
      </div>

      {members.length === 0 ? (
        <EmptyState icon={Users} title="No members yet" description="Add the people sharing this household's money." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <div key={m.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: m.avatarColor }}
                  >
                    {m.displayName.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{m.displayName}</p>
                    <p className="text-xs capitalize text-slate-500 dark:text-slate-400">{m.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditingMember(m)} className="btn-ghost !p-1.5" aria-label="Edit member">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => { setDeletingMember(m); setDeleteError(null); }} className="btn-ghost !p-1.5 hover:text-red-500" aria-label="Remove member">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Monthly income: <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(m.monthlyIncome)}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      <MemberFormModal open={formOpen} onClose={() => setFormOpen(false)} />
      <MemberFormModal open={!!editingMember} member={editingMember} onClose={() => setEditingMember(null)} />
      <ConfirmDialog
        open={!!deletingMember}
        title="Remove member"
        description={
          deleteError ||
          `This removes "${deletingMember?.displayName}" from the household. This can't be undone, and fails if they still own any debts, cards, or buckets.`
        }
        confirmLabel="Remove"
        loading={deleteMember.isPending}
        onConfirm={onConfirmDelete}
        onCancel={() => setDeletingMember(null)}
      />
    </motion.div>
  );
}
