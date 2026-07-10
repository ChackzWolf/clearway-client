import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Users } from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Onboarding() {
  const { refreshHousehold, signOut } = useAuth();
  const [householdName, setHouseholdName] = useState("Our Household");
  const [displayName, setDisplayName] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.createHousehold({
        name: householdName,
        displayName,
        monthlyIncome: monthlyIncome ? Number(monthlyIncome) : 0,
      });
      await refreshHousehold();
    } catch (err: any) {
      setError(err.message || "Could not create household");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-light px-4 dark:bg-surface-dark">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card w-full max-w-md p-8"
      >
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl2 bg-brand text-white">
            <Users size={22} />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Set up your household</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            You can add a partner's profile afterwards — no separate login needed for them.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Household name</label>
            <input className="input" required value={householdName} onChange={(e) => setHouseholdName(e.target.value)} />
          </div>
          <div>
            <label className="label">Your name</label>
            <input
              className="input"
              required
              placeholder="e.g. Arjun"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Your monthly income (optional)</label>
            <input
              className="input"
              type="number"
              min={0}
              placeholder="0"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
            />
          </div>

          {error && (
            <p className="rounded-xl2 border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading && <Loader2 size={16} className="animate-spin" />}
            Create household
          </button>
        </form>

        <button onClick={signOut} className="mt-4 w-full text-center text-sm text-slate-500 hover:underline dark:text-slate-400">
          Sign out
        </button>
      </motion.div>
    </div>
  );
}
