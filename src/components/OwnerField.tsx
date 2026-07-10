import { useHouseholdStore } from "../store/useHouseholdStore";

// Shared "who does this belong to" control used by Debt/CreditCard/Bucket forms:
// either shared/joint, or owned by one specific household member.
export function OwnerField({
  isShared,
  ownerMemberId,
  onChange,
}: {
  isShared: boolean;
  ownerMemberId: string | null;
  onChange: (next: { isShared: boolean; ownerMemberId: string | null }) => void;
}) {
  const members = useHouseholdStore((s) => s.members);

  return (
    <div>
      <label className="label">Belongs to</label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange({ isShared: true, ownerMemberId: null })}
          className={`rounded-xl2 border px-3 py-2 text-sm font-medium transition-colors ${
            isShared
              ? "border-brand bg-brand/10 text-brand"
              : "border-surface-lightBorder text-slate-600 dark:border-surface-darkBorder dark:text-slate-300"
          }`}
        >
          Shared
        </button>
        {members.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange({ isShared: false, ownerMemberId: m.id })}
            className={`rounded-xl2 border px-3 py-2 text-sm font-medium transition-colors ${
              !isShared && ownerMemberId === m.id
                ? "border-brand bg-brand/10 text-brand"
                : "border-surface-lightBorder text-slate-600 dark:border-surface-darkBorder dark:text-slate-300"
            }`}
          >
            {m.displayName}
          </button>
        ))}
      </div>
    </div>
  );
}
