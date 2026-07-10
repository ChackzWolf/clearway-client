export function LoadingScreen({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-surface-light dark:bg-surface-dark">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  );
}
