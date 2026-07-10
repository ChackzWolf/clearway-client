import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "./Modal";
import { OwnerField } from "./OwnerField";
import { useCreateCreditCard, useUpdateCreditCard } from "../hooks/useCreditCards";

export function CreditCardFormModal({ open, onClose, card }: { open: boolean; onClose: () => void; card?: any | null }) {
  const isEdit = !!card;
  const createCard = useCreateCreditCard();
  const updateCard = useUpdateCreditCard();
  const [name, setName] = useState("");
  const [isShared, setIsShared] = useState(true);
  const [ownerMemberId, setOwnerMemberId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (card) {
      setName(card.name);
      setIsShared(card.is_shared);
      setOwnerMemberId(card.owner_member_id);
    } else {
      setName("");
      setIsShared(true);
      setOwnerMemberId(null);
    }
    setError(null);
  }, [open, card]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = { name, isShared, ownerMemberId: isShared ? null : ownerMemberId };
    try {
      if (isEdit) {
        await updateCard.mutateAsync({ cardId: card.id, payload });
      } else {
        await createCard.mutateAsync(payload);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || `Could not ${isEdit ? "update" : "add"} card`);
    }
  }

  const pending = createCard.isPending || updateCard.isPending;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit credit card" : "Add a credit card"}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Card name</label>
          <input className="input" required placeholder="e.g. HDFC Regalia" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <OwnerField isShared={isShared} ownerMemberId={ownerMemberId} onChange={(v) => { setIsShared(v.isShared); setOwnerMemberId(v.ownerMemberId); }} />
        {error && <p className="rounded-xl2 border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending && <Loader2 size={16} className="animate-spin" />}
          {isEdit ? "Save changes" : "Add card"}
        </button>
      </form>
    </Modal>
  );
}
