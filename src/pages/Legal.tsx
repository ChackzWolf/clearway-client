import { Link } from "react-router-dom";
import { Wallet } from "lucide-react";

const LAST_UPDATED = "10 July 2026";

export default function Legal() {
  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      <header className="border-b border-surface-lightBorder px-4 py-4 dark:border-surface-darkBorder">
        <Link to="/login" className="flex w-fit items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl2 bg-brand text-white">
            <Wallet size={16} />
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">Clearway</span>
        </Link>
      </header>

      <main className="mx-auto max-w-2xl space-y-12 px-4 py-10 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        <section id="privacy">
          <h1 className="mb-1 text-2xl font-semibold text-slate-900 dark:text-white">Privacy Policy</h1>
          <p className="mb-6 text-xs text-slate-400 dark:text-slate-500">Last updated {LAST_UPDATED}</p>

          <div className="space-y-5">
            <div>
              <h2 className="mb-1.5 font-semibold text-slate-900 dark:text-white">What we collect</h2>
              <p>
                Your email and password (handled entirely by our authentication provider, Supabase — we never see
                or store your password ourselves), your household and member names, the monthly income figures you
                enter, and every debt, credit card, savings bucket, and recurring expense you add. If you upload a
                photo to a bucket or paste a product link, we store that too.
              </p>
            </div>
            <div>
              <h2 className="mb-1.5 font-semibold text-slate-900 dark:text-white">Where it's stored</h2>
              <p>
                Everything lives in Supabase (Postgres, Auth, and Storage), our infrastructure provider. Row Level
                Security is enforced at the database level, meaning only the members of your own household can ever
                read or write your data — not other users, and not us, through the normal application.
              </p>
            </div>
            <div>
              <h2 className="mb-1.5 font-semibold text-slate-900 dark:text-white">Third parties</h2>
              <p>
                Supabase is our only data processor. When you paste a product link into a bucket, our server
                (not your browser) fetches that page once to try to read its title and image — the destination
                site sees a request from us, not from you personally. We do not sell your data, share it across
                households, or use it for advertising.
              </p>
            </div>
            <div>
              <h2 className="mb-1.5 font-semibold text-slate-900 dark:text-white">Cookies & tracking</h2>
              <p>
                We use browser local storage only to keep you signed in — no third-party analytics or advertising
                trackers are installed on this site as of the date above.
              </p>
            </div>
            <div>
              <h2 className="mb-1.5 font-semibold text-slate-900 dark:text-white">Your controls</h2>
              <p>
                You can edit or delete any of your data from within the app at any time. To request full account
                and data deletion, contact us at{" "}
                <span className="font-medium text-slate-900 dark:text-white">[INSERT CONTACT EMAIL]</span>.
              </p>
            </div>
            <div>
              <h2 className="mb-1.5 font-semibold text-slate-900 dark:text-white">Changes</h2>
              <p>We may update this policy from time to time; the date above reflects the most recent change.</p>
            </div>
          </div>
        </section>

        <section id="terms">
          <h1 className="mb-1 text-2xl font-semibold text-slate-900 dark:text-white">Terms of Service</h1>
          <p className="mb-6 text-xs text-slate-400 dark:text-slate-500">Last updated {LAST_UPDATED}</p>

          <div className="space-y-5">
            <div>
              <h2 className="mb-1.5 font-semibold text-slate-900 dark:text-white">What this is</h2>
              <p>
                Clearway is a personal record-keeping tool for tracking debts, EMIs, savings goals, and recurring
                expenses you tell it about. It is not financial, tax, or legal advice, and the "insights" it shows
                are simple, explainable rule-based calculations — not recommendations from a licensed advisor.
              </p>
            </div>
            <div>
              <h2 className="mb-1.5 font-semibold text-slate-900 dark:text-white">Your responsibilities</h2>
              <p>
                You're responsible for the accuracy of what you enter and for keeping your login credentials
                secure. Don't use the service to store data on someone else's behalf without their knowledge, and
                don't attempt to access another household's data or abuse/overload the service.
              </p>
            </div>
            <div>
              <h2 className="mb-1.5 font-semibold text-slate-900 dark:text-white">No warranty</h2>
              <p>
                The service is provided "as is," without warranty of any kind. To the extent permitted by law, we
                aren't liable for financial decisions made based on figures shown in the app, or for data loss.
              </p>
            </div>
            <div>
              <h2 className="mb-1.5 font-semibold text-slate-900 dark:text-white">Account suspension</h2>
              <p>We may suspend or terminate accounts that violate these terms or abuse the service.</p>
            </div>
            <div>
              <h2 className="mb-1.5 font-semibold text-slate-900 dark:text-white">Governing law</h2>
              <p>These terms are governed by the laws of [INSERT JURISDICTION].</p>
            </div>
            <div>
              <h2 className="mb-1.5 font-semibold text-slate-900 dark:text-white">Contact</h2>
              <p>
                Questions about these terms? Reach us at{" "}
                <span className="font-medium text-slate-900 dark:text-white">[INSERT CONTACT EMAIL]</span>.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
