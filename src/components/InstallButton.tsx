import { useState } from "react";
import { Download, Share, SquarePlus } from "lucide-react";
import { usePwaInstall } from "../hooks/usePwaInstall";
import { Modal } from "./Modal";

export function InstallButton({ className = "" }: { className?: string }) {
  const { canInstall, canPromptNatively, canShowIosSteps, promptInstall } = usePwaInstall();
  const [showIosSteps, setShowIosSteps] = useState(false);

  if (!canInstall) return null;

  return (
    <>
      <button
        type="button"
        onClick={canPromptNatively ? promptInstall : () => setShowIosSteps(true)}
        className={className}
      >
        <Download size={18} />
        Install app
      </button>

      {canShowIosSteps && (
        <Modal open={showIosSteps} onClose={() => setShowIosSteps(false)} title="Install Clearway">
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Add Clearway to your Home Screen for a full-screen, app-like experience.
          </p>
          <ol className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
            <li className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 font-semibold text-brand">
                1
              </span>
              Tap the <Share size={16} className="inline text-brand" /> Share icon in Safari's toolbar
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 font-semibold text-brand">
                2
              </span>
              Scroll down and tap <SquarePlus size={16} className="inline text-brand" /> "Add to Home Screen"
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 font-semibold text-brand">
                3
              </span>
              Tap "Add" — Clearway will appear on your Home Screen
            </li>
          </ol>
        </Modal>
      )}
    </>
  );
}
