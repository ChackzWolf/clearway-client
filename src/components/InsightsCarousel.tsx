import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, TrendingUp, TriangleAlert, Sparkles, Lightbulb } from "lucide-react";

export interface Insight {
  tone: "positive" | "warning" | "action" | "neutral";
  text: string;
}

const TONE_META = {
  positive: { icon: TrendingUp, chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  warning: { icon: TriangleAlert, chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  action: { icon: Sparkles, chip: "bg-brand/10 text-brand" },
  neutral: { icon: Lightbulb, chip: "bg-slate-500/10 text-slate-600 dark:text-slate-300" },
} as const;

const AUTO_ADVANCE_MS = 6000;

// Auto-rotating slider so every applicable insight gets seen, not just
// whichever ones fit in a static list — pauses on hover so it doesn't race
// past something you're mid-read on.
export function InsightsCarousel({ insights }: { insights: Insight[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (index >= insights.length) setIndex(0);
  }, [insights.length, index]);

  useEffect(() => {
    if (insights.length <= 1 || paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % insights.length), AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [insights.length, paused]);

  if (insights.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">No insights yet.</p>;
  }

  const current = insights[index];
  const meta = TONE_META[current.tone] ?? TONE_META.neutral;
  const Icon = meta.icon;

  function go(delta: number) {
    setIndex((i) => (i + delta + insights.length) % insights.length);
  }

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative min-h-[5.5rem] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex items-start gap-3 rounded-xl2 bg-slate-50 p-3.5 text-sm text-slate-700 dark:bg-white/5 dark:text-slate-200"
          >
            <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${meta.chip}`}>
              <Icon size={14} />
            </span>
            <span className="leading-snug">{current.text}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {insights.length > 1 && (
        <div className="mt-3 flex items-center justify-between">
          <button type="button" onClick={() => go(-1)} className="btn-ghost !p-1.5" aria-label="Previous insight">
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-1.5">
            {insights.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-4 bg-brand" : "w-1.5 bg-slate-300 dark:bg-white/20"}`}
                aria-label={`Go to insight ${i + 1} of ${insights.length}`}
              />
            ))}
          </div>
          <button type="button" onClick={() => go(1)} className="btn-ghost !p-1.5" aria-label="Next insight">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
