"use client";

import { useState } from "react";
import { Check, Copy, Globe, Lock, Pencil, Trash2 } from "lucide-react";
import { Prompt } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

export default function PromptCard({
  prompt,
  onEdit,
  onDelete,
  onToggleVisibility,
}: {
  prompt: Prompt;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt.content);
    } catch {
      // Fallback for older browsers / non-HTTPS
      const ta = document.createElement("textarea");
      ta.value = prompt.content;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <article className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-0.5 hover:border-violet-500/40 hover:bg-white/[0.05]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold leading-snug text-white">{prompt.title}</h3>
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
              <span className="flex items-center gap-1.5">
                {prompt.author_image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={prompt.author_image} alt="" className="h-4 w-4 rounded-full" />
                )}
                by {prompt.author ?? "unknown"}
              </span>
            )}
            <span>· {timeAgo(prompt.created_at)}</span>
          </div>
        </div>

        <button
          onClick={copy}
          title="Copy to clipboard"
          className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
            copied
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border-white/10 bg-white/5 text-white/70 hover:border-violet-500/50 hover:text-white"
          }`}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <pre className="line-clamp-6 flex-1 overflow-hidden whitespace-pre-wrap font-mono text-xs leading-relaxed text-white/55">
        {prompt.content}
      </pre>

      {prompt.own && (
        <div className="mt-4 flex items-center gap-1 border-t border-white/5 pt-3 text-xs">
          <button
            onClick={onToggleVisibility}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            {prompt.is_public ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
            {prompt.is_public ? "Make private" : "Make public"}
          </button>
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
          <button
            onClick={onDelete}
            className="ml-auto flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-white/40 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      )}
    </article>
  );
}