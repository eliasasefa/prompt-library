"use client";

import { useEffect, useRef } from "react";
import { Check, Copy, Globe, Lock, Pencil, Share2, X } from "lucide-react";
import { Prompt } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

type Props = {
  open: boolean;
  prompt: Prompt | null;
  copied: boolean;
  onClose: () => void;
  onCopy: () => void;
  onShare?: () => void;
  onEdit?: () => void;
};

export default function PromptDetailSheet({
  open,
  prompt,
  copied,
  onClose,
  onCopy,
  onShare,
  onEdit,
}: Props) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

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

  if (!open || !prompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="prompt-detail-title"
        className="relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-[#0d0d15] shadow-2xl sm:max-h-[85vh] sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <h2 id="prompt-detail-title" className="text-base font-semibold leading-snug sm:text-lg">
              {prompt.title}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/40">
              {prompt.category && (
                <span className="rounded-full bg-violet-500/15 px-2 py-0.5 font-medium text-violet-300">
                  {prompt.category}
                </span>
              )}
              {prompt.own ? (
                <span className="flex items-center gap-1">
                  {prompt.is_public ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                  {prompt.is_public ? "Public" : "Private"}
                </span>
              ) : (
                <span>by {prompt.author ?? "unknown"}</span>
              )}
              <span>· {timeAgo(prompt.created_at)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-white/80">
            {prompt.content}
          </pre>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 border-t border-white/10 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={onCopy}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
              copied
                ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 hover:opacity-90"
            }`}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy prompt"}
          </button>
          {prompt.is_public && onShare && (
            <button
              type="button"
              onClick={onShare}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
            >
              <Share2 className="h-4 w-4" /> Share
            </button>
          )}
          {prompt.own && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
            >
              <Pencil className="h-4 w-4" /> Edit
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-xl border border-white/10 px-3 py-2 text-sm text-white/60 hover:bg-white/5"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function isLongPrompt(content: string) {
  return content.length > 280 || content.split("\n").length > 6;
}
