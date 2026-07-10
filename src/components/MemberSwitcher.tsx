import { useHouseholdStore } from "../store/useHouseholdStore";

export function MemberSwitcher() {
  const { members, activeMemberId, setActiveMember } = useHouseholdStore();

  const options = [...members.map((m) => ({ id: m.id, label: m.displayName })), { id: "combined", label: "Combined" }];

  return (
    <div className="flex items-center gap-1 rounded-xl2 border border-surface-lightBorder bg-white p-1 dark:border-surface-darkBorder dark:bg-surface-darkCard">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => setActiveMember(opt.id)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            activeMemberId === opt.id
              ? "bg-brand text-white"
              : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
