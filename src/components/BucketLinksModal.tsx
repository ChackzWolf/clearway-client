import { useState } from "react";
import { Loader2, Plus, RefreshCw, Trash2, ExternalLink } from "lucide-react";
import { Modal } from "./Modal";
import { useAddBucketLink, useDeleteBucketLink, useRefreshBucketLink } from "../hooks/useBuckets";
import { formatCurrency } from "../lib/format";

function siteNameFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").split(".")[0];
  } catch {
    return "Link";
  }
}

export function BucketLinksModal({ bucket, onClose }: { bucket: any | null; onClose: () => void }) {
  const addLink = useAddBucketLink();
  const deleteLink = useDeleteBucketLink();
  const refreshLink = useRefreshBucketLink();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  if (!bucket) return null;
  const links = bucket.bucket_links || [];

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await addLink.mutateAsync({ bucketId: bucket.id, url });
      setUrl("");
    } catch (err: any) {
      setError(err.message || "Could not add link");
    }
  }

  async function onRefresh(linkId: string) {
    setRefreshingId(linkId);
    try {
      await refreshLink.mutateAsync({ bucketId: bucket.id, linkId });
    } finally {
      setRefreshingId(null);
    }
  }

  return (
    <Modal open={!!bucket} onClose={onClose} title={`Links for ${bucket.name}`}>
      <p className="mb-4 text-xs text-slate-400 dark:text-slate-500">
        Paste a product page from Amazon, Flipkart, Meesho, etc. — title and image are auto-filled when possible (price
        rarely is, since these sites block that). Everything's editable.
      </p>

      <form onSubmit={onAdd} className="mb-4 flex gap-2">
        <input
          className="input"
          type="url"
          required
          placeholder="https://www.amazon.in/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button type="submit" disabled={addLink.isPending} className="btn-primary shrink-0 !px-3">
          {addLink.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
        </button>
      </form>
      {error && <p className="mb-4 rounded-xl2 border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}

      {links.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">No links yet — paste one above.</p>
      ) : (
        <ul className="space-y-2">
          {links.map((link: any) => (
            <li key={link.id} className="flex items-center gap-3 rounded-xl2 border border-surface-lightBorder p-3 dark:border-surface-darkBorder">
              {link.image_url ? (
                <img src={link.image_url} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-white/5">
                  <ExternalLink size={16} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate text-sm font-medium text-slate-900 hover:underline dark:text-white"
                >
                  {link.label || siteNameFromUrl(link.url)}
                </a>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {link.price != null ? formatCurrency(link.price) : "No price set"} · {siteNameFromUrl(link.url)}
                </p>
              </div>
              <button
                onClick={() => onRefresh(link.id)}
                disabled={refreshingId === link.id}
                className="btn-ghost !p-1.5"
                aria-label="Refresh link preview"
              >
                <RefreshCw size={14} className={refreshingId === link.id ? "animate-spin" : ""} />
              </button>
              <button
                onClick={() => deleteLink.mutate({ bucketId: bucket.id, linkId: link.id })}
                className="btn-ghost !p-1.5 hover:text-red-500"
                aria-label="Delete link"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
