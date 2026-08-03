"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Category, Prompt } from "@/lib/types";

type Props = {
  open: boolean;
  editing: Prompt | null;
  categories: Category[];
  onClose: () => void;
  onSave: (
    data: { title: string; content: string; categoryId: number | null; isPublic: boolean },
    id?: number
  ) => Promise<void>;
};

export default function PromptModal({ open, editing, categories, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(editing?.title ?? "");
      setContent(editing?.content ?? "");
      setCategoryId(editing?.category_id ? String(editing.category_id) : "");
      setIsPublic(editing?.is_public ?? false);
      setError(null);
      setSaving(false);
    }
  }, [open, editing]);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and prompt content are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(
        {
          title: title.trim(),
          content: content.trim(),
          categoryId: categoryId ? Number(categoryId) : null,
          isPublic,
        },
        editing?.id
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={submit}
        className="relative my-8 w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0d0d15] p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{editing ? "Edit prompt" : "New prompt"}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="e.g. Code review expert"
              autoFocus
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none placeholder:text-white/25 focus:border-violet-500/50"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-violet-500/50"
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">
                Visibility
              </label>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2"
              >
                <span
                  className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                    isPublic ? "bg-violet-500" : "bg-white/15"
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition ${
                      isPublic ? "translate-x-4" : ""
                    }`}
                  />
                </span>
                <span className="truncate text-sm text-white/70">
                  {isPublic ? "Public — visible in Explore" : "Private — only you"}
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">
              Prompt
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={9}
              placeholder="Paste or write your prompt here…"
              className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm leading-relaxed outline-none placeholder:text-white/25 focus:border-violet-500/50"
            />
            <p className="mt-1 text-right text-xs text-white/25">{content.length} / 20000</p>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : editing ? "Save changes" : "Save prompt"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}