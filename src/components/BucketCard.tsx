import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Pencil, Trash2, Wallet, Link2, GripVertical } from "lucide-react";
import { Badge } from "./Badge";
import { ProgressBar } from "./ProgressBar";
import { formatCurrency, formatDate } from "../lib/format";

const PRIORITY_TONE: Record<string, "red" | "amber" | "slate"> = { High: "red", Medium: "amber", Low: "slate" };

export function BucketCard({
  bucket: b,
  ownerLabel,
  onEdit,
  onDelete,
  onLinks,
  onContribute,
}: {
  bucket: any;
  ownerLabel: string;
  onEdit: () => void;
  onDelete: () => void;
  onLinks: () => void;
  onContribute: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: b.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  const pct = Number(b.target_amount) > 0 ? (Number(b.current_amount) / Number(b.target_amount)) * 100 : 0;
  // A goal you haven't put any money toward yet — "just things I want to buy,"
  // not something actively being funded — gets called out so it doesn't read
  // like a stalled savings goal.
  const isWishlist = !b.is_completed && Number(b.current_amount) === 0 && Number(b.monthly_contribution) <= 0;

  return (
    <div ref={setNodeRef} style={style} className="card overflow-hidden p-5">
      {b.image_url && (
        <img src={b.image_url} alt="" className="-mx-5 -mt-5 mb-4 h-32 w-[calc(100%+2.5rem)] object-cover" />
      )}
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-1.5">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none text-slate-300 hover:text-slate-500 active:cursor-grabbing dark:text-slate-600 dark:hover:text-slate-400"
            aria-label="Drag to reorder"
          >
            <GripVertical size={16} />
          </button>
          <span className="text-xl">{b.icon}</span>
          <p className="font-medium text-slate-900 dark:text-white">{b.name}</p>
        </div>
        <div className="flex items-center gap-1">
          {b.is_completed && <Badge tone="emerald">Done</Badge>}
          <button onClick={onLinks} className="btn-ghost !p-1.5" aria-label="Manage links">
            <Link2 size={13} />
            {b.bucket_links?.length > 0 && <span className="ml-0.5 text-xs">{b.bucket_links.length}</span>}
          </button>
          <button onClick={onEdit} className="btn-ghost !p-1.5" aria-label="Edit bucket">
            <Pencil size={13} />
          </button>
          <button onClick={onDelete} className="btn-ghost !p-1.5 hover:text-red-500" aria-label="Delete bucket">
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
        {isWishlist && <Badge tone="slate">Wishlist</Badge>}
        <Badge tone={PRIORITY_TONE[b.priority]}>{b.priority}</Badge>
        <Badge tone="brand">{ownerLabel}</Badge>
        {b.monthly_contribution > 0 && <Badge>{formatCurrency(b.monthly_contribution)}/mo</Badge>}
      </div>

      {b.deadline && <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Target date: {formatDate(b.deadline)}</p>}

      <button className="btn-secondary mt-3 w-full justify-center text-sm" onClick={onContribute} disabled={b.is_completed}>
        <Wallet size={14} />
        Add money
      </button>
    </div>
  );
}
