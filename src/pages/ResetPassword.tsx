import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wallet, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "../services/supabaseClient";

// Reached via the link in Supabase's password-reset email. supabase-js
// auto-establishes a temporary recovery session from the URL on load
// (detectSessionInUrl is on by default) — we just collect the new password.
export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => navigate("/"), 1500);
    } catch (err: any) {
      setError(err.message || "Could not reset password");
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
        className="card w-full max-w-sm p-8"
      >
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl2 bg-brand text-white">
            <Wallet size={22} />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Set a new password</h1>
        </div>

        {done ? (
          <div className="flex items-center gap-2 rounded-xl2 border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-slate-700 dark:text-slate-200">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
            Password updated — taking you in...
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label">New password</label>
              <input
                className="input"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="label">Confirm password</label>
              <input
                className="input"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-xl2 border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Update password
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
