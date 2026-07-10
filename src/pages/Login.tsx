import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Wallet, Loader2 } from "lucide-react";
import { signIn, signUp, requestPasswordReset } from "../services/supabaseClient";

type Mode = "signin" | "signup" | "forgot";

export default function Login() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedUp, setSignedUp] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setSignedUp(false);
    setResetSent(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await requestPasswordReset(email);
        if (error) throw error;
        setResetSent(true);
      } else {
        const { error } = mode === "signin" ? await signIn(email, password) : await signUp(email, password);
        if (error) throw error;
        if (mode === "signup") setSignedUp(true);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
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
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Clearway</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track debt payoff and goal savings for your household.
          </p>
        </div>

        {signedUp ? (
          <div className="rounded-xl2 border border-brand/30 bg-brand/10 p-4 text-sm text-slate-700 dark:text-slate-200">
            Check your inbox to confirm your email, then sign in.
          </div>
        ) : resetSent ? (
          <div className="rounded-xl2 border border-brand/30 bg-brand/10 p-4 text-sm text-slate-700 dark:text-slate-200">
            If an account exists for that email, a reset link is on its way — check your inbox.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            {mode !== "forgot" && (
              <div>
                <label className="label">Password</label>
                <input
                  className="input"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    className="mt-1.5 text-xs font-medium text-brand hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            )}

            {error && (
              <p className="rounded-xl2 border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
          {mode === "forgot" ? (
            <button className="font-medium text-brand hover:underline" onClick={() => switchMode("signin")}>
              Back to sign in
            </button>
          ) : (
            <>
              {mode === "signin" ? "New to Clearway?" : "Already have an account?"}{" "}
              <button className="font-medium text-brand hover:underline" onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}>
                {mode === "signin" ? "Create an account" : "Sign in"}
              </button>
            </>
          )}
        </p>

        {mode === "signup" && (
          <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
            By creating an account you agree to our{" "}
            <Link to="/legal#terms" className="underline hover:text-slate-600 dark:hover:text-slate-300">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/legal#privacy" className="underline hover:text-slate-600 dark:hover:text-slate-300">
              Privacy Policy
            </Link>
            .
          </p>
        )}
      </motion.div>
    </div>
  );
}
