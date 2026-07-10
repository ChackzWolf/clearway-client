import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "./Modal";
import { useAddMember, useUpdateMember } from "../hooks/useMembers";

const COLORS = ["#3B6FF2", "#D4537E", "#2FAE7A", "#E0A639", "#8B5CF6", "#EF4444"];

export function MemberFormModal({ open, onClose, member }: { open: boolean; onClose: () => void; member?: any | null }) {
  const isEdit = !!member;
  const addMember = useAddMember();
  const updateMember = useUpdateMember();
  const [displayName, setDisplayName] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [avatarColor, setAvatarColor] = useState(COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (member) {
      setDisplayName(member.displayName);
      setMonthlyIncome(String(member.monthlyIncome || 0));
      setAvatarColor(member.avatarColor || COLORS[0]);
    } else {
      setDisplayName("");
      setMonthlyIncome("");
      setAvatarColor(COLORS[0]);
    }
    setError(null);
  }, [open, member]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = { displayName, monthlyIncome: monthlyIncome ? Number(monthlyIncome) : 0, avatarColor };
    try {
      if (isEdit) {
        await updateMember.mutateAsync({ memberId: member.id, payload });
      } else {
        await addMember.mutateAsync(payload);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || `Could not ${isEdit ? "update" : "add"} member`);
    }
  }

  const pending = addMember.isPending || updateMember.isPending;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit member" : "Add a household member"}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Name</label>
          <input className="input" required placeholder="e.g. Meera" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>
        <div>
          <label className="label">Monthly income (₹)</label>
          <input className="input" type="number" min={0} value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} />
        </div>
        <div>
          <label className="label">Color</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAvatarColor(c)}
                className="h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-white dark:ring-offset-surface-darkCard"
                style={{ backgroundColor: c, ...(avatarColor === c ? { boxShadow: "0 0 0 2px white, 0 0 0 4px " + c } : {}) }}
              />
            ))}
          </div>
        </div>
        {error && <p className="rounded-xl2 border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending && <Loader2 size={16} className="animate-spin" />}
          {isEdit ? "Save changes" : "Add member"}
        </button>
      </form>
    </Modal>
  );
}
