"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Undo2, X } from "lucide-react";
import { Category, Prompt } from "@/lib/types";
import AIPromptActions from "@/components/AIPromptActions";

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
  const [previousContent, setPreviousContent] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const [aiSession, setAiSession] = useState(0);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const promptSectionRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    setTitle(editing?.title ?? "");
    setContent(editing?.content ?? "");
    setCategoryId(editing?.category_id ? String(editing.category_id) : "");
    setIsPublic(editing?.is_public ?? false);
    setError(null);
    setSaving(false);
    setPreviousContent(null);
    setApplied(false);
    setAiSession(0);
  }, [open, editing]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseRef.current();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  function applyPrompt(value: string) {
    setPreviousContent(content);
    setContent(value.slice(0, 20000));
    setApplied(true);
    setAiSession((n) => n + 1);
    window.setTimeout(() => {
      promptSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      editorRef.current?.focus();
    }, 0);
  }

  function undoApply() {
    if (previousContent == null) return;
    setContent(previousContent);
    setPreviousContent(null);
    setApplied(false);
    editorRef.current?.focus();
  }

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
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={submit}
        className="relative flex max-h-[96dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-[#0d0d15] shadow-2xl sm:my-6 sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-semibold">{editing ? "Edit prompt" : "New prompt"}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
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

          <div ref={promptSectionRef}>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label htmlFor="prompt-content" className="text-xs font-medium uppercase tracking-wider text-white/40">
                Prompt
              </label>
              {applied && (
                <span className="text-[11px] text-violet-300">AI version in the editor — save to keep</span>
              )}
            </div>
            <textarea
              id="prompt-content"
              ref={editorRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setApplied(false);
              }}
              maxLength={20000}
              rows={8}
              placeholder="Paste or write your prompt here…"
              className={`w-full resize-y rounded-xl border bg-black/30 px-3 py-2 font-mono text-sm leading-relaxed outline-none placeholder:text-white/25 ${
                applied
                  ? "border-violet-400/60 ring-2 ring-violet-500/20"
                  : "border-white/10 focus:border-violet-500/50"
              }`}
            />
            <p className="mt-1 text-right text-xs text-white/25">{content.length.toLocaleString()} / 20,000</p>

            {previousContent != null && (
              <div
                className="mt-3 flex flex-col gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100 sm:flex-row sm:items-center sm:justify-between"
                aria-live="polite"
              >
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0" />
                  Replaced the prompt above. Undo if you want the previous version.
                </span>
                <button
                  type="button"
                  onClick={undoApply}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-emerald-100 hover:bg-emerald-400/15"
                >
                  <Undo2 className="h-3.5 w-3.5" /> Undo
                </button>
              </div>
            )}

            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-white/40">
                AI tools
              </p>
              <p className="mb-3 text-xs text-white/35">
                {previousContent != null
                  ? "Want another rewrite? Run a tool again on the updated prompt."
                  : "Replace prompt puts the suggestion in the field above and closes this result."}
              </p>
              <AIPromptActions
                key={`${editing?.id ?? "new"}-${aiSession}`}
                prompt={content}
                onApplyPrompt={applyPrompt}
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-white/10 px-5 py-3">
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
      </form>
    </div>
  );
}