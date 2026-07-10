import { Loader2, TriangleAlert } from "lucide-react";
import { Modal } from "./Modal";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="mb-5 flex items-start gap-3 rounded-xl2 bg-red-500/10 p-4">
        <TriangleAlert className="mt-0.5 shrink-0 text-red-500" size={20} />
        <p className="text-sm text-slate-700 dark:text-slate-200">{description}</p>
      </div>
      <div className="flex gap-3">
        <button className="btn-secondary flex-1" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl2 bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
