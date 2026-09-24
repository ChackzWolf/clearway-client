import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Landmark,
  CreditCard,
  PiggyBank,
  Repeat,
  CalendarDays,
  Users,
  Sun,
  Moon,
  LogOut,
  Wallet,
  MoreHorizontal,
  Download,
  Share,
  SquarePlus,
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { usePwaInstall } from "../hooks/usePwaInstall";
import { useAuth } from "../context/AuthContext";
import { MemberSwitcher } from "./MemberSwitcher";
import { Modal } from "./Modal";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/debts", label: "Debts", icon: Landmark, end: false },
  { to: "/credit-cards", label: "Credit Cards", icon: CreditCard, end: false },
  { to: "/buckets", label: "Buckets", icon: PiggyBank, end: false },
  { to: "/expenses", label: "Expenses", icon: Repeat, end: false },
  { to: "/calendar", label: "Calendar", icon: CalendarDays, end: false },
  { to: "/household", label: "Household", icon: Users, end: false },
];

// The bottom tab bar only has room for ~5 comfortable touch targets — the
// rest live behind "More" instead of scrolling or squeezing 7 icons in.
const MOBILE_PRIMARY_PATHS = new Set(["/", "/debts", "/buckets", "/expenses"]);
const primaryItems = NAV_ITEMS.filter((i) => MOBILE_PRIMARY_PATHS.has(i.to));
const moreItems = NAV_ITEMS.filter((i) => !MOBILE_PRIMARY_PATHS.has(i.to));

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl2 px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-brand/10 text-brand"
                : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
            }`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </>
  );
}

function InstallButton({ className = "" }: { className?: string }) {
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

export function Layout() {
  const { isDark, toggle } = useTheme();
  const { signOut } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      {/* Sidebar — only past `lg` (landscape tablets and up). Portrait
          tablets get the same bottom-nav treatment as phones. */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-surface-lightBorder bg-white p-4 dark:border-surface-darkBorder dark:bg-surface-darkCard lg:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl2 bg-brand text-white">
            <Wallet size={18} />
          </div>
          <span className="text-lg font-semibold text-slate-900 dark:text-white">Clearway</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          <NavItems />
        </nav>
        <InstallButton className="btn-ghost justify-start" />
        <button onClick={toggle} className="btn-ghost justify-start">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          {isDark ? "Light mode" : "Dark mode"}
        </button>
        <button onClick={signOut} className="btn-ghost justify-start text-red-500 hover:bg-red-500/10">
          <LogOut size={18} />
          Sign out
        </button>
      </aside>

      <div className="flex flex-col lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-surface-lightBorder bg-white/80 px-4 py-3 backdrop-blur dark:border-surface-darkBorder dark:bg-surface-dark/80 lg:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl2 bg-brand text-white">
              <Wallet size={16} />
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">Clearway</span>
          </div>
          <MemberSwitcher />
          <InstallButton className="btn-ghost !gap-1.5 !px-2.5 text-xs lg:hidden" />
        </header>

        <main className="flex-1 px-4 pb-24 pt-4 lg:px-8 lg:pb-8 lg:pt-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav — primary destinations only, everything else (plus
          theme + sign out, which have no other home on mobile) is in "More". */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-surface-lightBorder bg-white/95 px-1 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur dark:border-surface-darkBorder dark:bg-surface-darkCard/95 lg:hidden">
        {primaryItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium ${
                isActive ? "text-brand" : "text-slate-400"
              }`
            }
          >
            <Icon size={19} />
            {label}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium ${
            moreOpen ? "text-brand" : "text-slate-400"
          }`}
        >
          <MoreHorizontal size={19} />
          More
        </button>
      </nav>

      <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title="More">
        <div className="space-y-1">
          {moreItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMoreOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl2 px-3 py-2.5 text-sm font-medium ${
                  isActive
                    ? "bg-brand/10 text-brand"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </div>
        <div className="my-3 border-t border-surface-lightBorder dark:border-surface-darkBorder" />
        <InstallButton className="btn-ghost w-full justify-start" />
        <button onClick={toggle} className="btn-ghost w-full justify-start">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          {isDark ? "Light mode" : "Dark mode"}
        </button>
        <button onClick={signOut} className="btn-ghost w-full justify-start text-red-500 hover:bg-red-500/10">
          <LogOut size={18} />
          Sign out
        </button>
      </Modal>
    </div>
  );
}
