import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { buildMonthGrid, isSameDay } from "../lib/calendarGrid";
import { parseDateOnly, toDateOnlyString, formatDateOnlyDisplay } from "../lib/date";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// A real calendar popover — the whole point is that picking a date should be
// a couple of clicks, not typing digits into a dd-mm-yyyy text box.
export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  allowClear = true,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  allowClear?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => (value ? parseDateOnly(value) : new Date()));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function toggleOpen() {
    if (!open) setCursor(value ? parseDateOnly(value) : new Date());
    setOpen((o) => !o);
  }

  const weeks = buildMonthGrid(cursor.getFullYear(), cursor.getMonth());
  const selected = value ? parseDateOnly(value) : null;
  const today = new Date();

  return (
    <div className="relative" ref={containerRef}>
      <button type="button" onClick={toggleOpen} className="input flex items-center justify-between text-left">
        <span className={value ? "" : "text-slate-400"}>{value ? formatDateOnlyDisplay(value) : placeholder}</span>
        <span className="flex items-center gap-1.5">
          {value && allowClear && (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="rounded p-0.5 hover:bg-slate-200 dark:hover:bg-white/10"
            >
              <X size={14} />
            </span>
          )}
          <CalendarDays size={16} className="text-slate-400" />
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-72 rounded-xl2 border border-surface-lightBorder bg-white p-3 shadow-xl dark:border-surface-darkBorder dark:bg-surface-darkCard">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              className="btn-ghost !p-1.5"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              {MONTH_NAMES[cursor.getMonth()]} {cursor.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              className="btn-ghost !p-1.5"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 text-center text-[11px] text-slate-400">
            {WEEKDAYS.map((w, i) => (
              <div key={i} className="py-1">{w}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {weeks.flat().map((day, i) => {
              if (!day) return <div key={i} />;
              const isSelected = selected && isSameDay(day, selected);
              const isToday = isSameDay(day, today);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChange(toDateOnlyString(day));
                    setOpen(false);
                  }}
                  className={`h-8 w-8 rounded-lg text-sm transition-colors ${
                    isSelected
                      ? "bg-brand text-white"
                      : isToday
                      ? "border border-brand text-brand"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              onChange(toDateOnlyString(new Date()));
              setOpen(false);
            }}
            className="btn-ghost mt-2 w-full justify-center text-xs"
          >
            Today
          </button>
        </div>
      )}
    </div>
  );
}
