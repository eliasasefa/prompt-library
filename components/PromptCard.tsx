"use client";

import { useState } from "react";
import { Check, Copy, Globe, Lock, Pencil, Share2, Trash2, Heart, Sparkles, ChevronRight } from "lucide-react";
import { Prompt } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import FillVariablesModal from "./FillVariablesModal";
import PromptDetailSheet, { isLongPrompt } from "./PromptDetailSheet";

type Props = {
  prompt: Prompt;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  onVote: () => void;
};

export default function PromptCard({ prompt, onEdit, onDelete, onToggleVisibility, onVote }: Props) {
  const [copied, setCopied] = useState(false);
  const [showVars, setShowVars] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const hasVars = /\{\{([^}]+)\}\}/.test(prompt.content);
  const long = isLongPrompt(prompt.content);
  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/p/${prompt.id}` : "";

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function copy() {
    if (hasVars && prompt.own) {
      setShowVars(true);
      return;
    }
    await navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function share() {
    if (!prompt.is_public) {
      showToast("Make this prompt public first to share.");
      return;
    }
    navigator.clipboard.writeText(publicUrl);
    showToast("Public link copied");
  }

  function openEdit() {
    setDetailOpen(false);
    onEdit();
  }

  return (
    <>
      <article className="relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-0.5 hover:border-violet-500/40 hover:bg-white/[0.05]">
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

          <div className="flex shrink-0 items-center gap-1.5">
            {prompt.is_public && (
              <button
                onClick={onVote}
                title="Upvote"
                className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition ${
                  prompt.user_voted
                    ? "border-pink-500/40 bg-pink-500/10 text-pink-300"
                    : "border-white/10 bg-white/5 text-white/70 hover:border-pink-500/50"
                }`}
              >
                <Heart className={`h-3.5 w-3.5 ${prompt.user_voted ? "fill-current" : ""}`} /> {prompt.votes_count}
              </button>
            )}
            <button
              onClick={copy}
              title="Copy"
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                copied
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-white/10 bg-white/5 text-white/70 hover:border-violet-500/50 hover:text-white"
              }`}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {long ? (
          <button
            type="button"
            onClick={() => setDetailOpen(true)}
            className="group min-h-0 flex-1 text-left"
            aria-label={`View full prompt: ${prompt.title}`}
          >
            <span className="relative block">
              <pre className="line-clamp-6 overflow-hidden whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-white/55">
                {prompt.content}
              </pre>
              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0c0c12] to-transparent" />
            </span>
            <span className="mt-2 inline-flex items-center gap-0.5 text-xs font-medium text-violet-300 group-hover:text-violet-200">
              View full prompt <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </button>
        ) : (
          <pre className="flex-1 whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-white/55">
            {prompt.content}
          </pre>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-white/5 pt-3 text-xs">
          {prompt.is_public && (
            <button
              onClick={share}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-white/50 transition hover:bg-white/5 hover:text-white"
            >
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
          )}
          {prompt.own && (
            <>
              <button
                onClick={onToggleVisibility}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-white/50 transition hover:bg-white/5 hover:text-white"
              >
                {prompt.is_public ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{prompt.is_public ? "Make private" : "Make public"}</span>
              </button>
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-white/50 transition hover:bg-white/5 hover:text-white"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
                <Sparkles className="h-3.5 w-3.5 text-violet-300" />
              </button>
              <button
                onClick={onDelete}
                className="ml-auto flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-white/40 transition hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </>
          )}
        </div>
        {toast && (
          <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-lg border border-white/10 bg-black/80 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-md">
            {toast}
          </div>
        )}
      </article>
      <PromptDetailSheet
        open={detailOpen}
        prompt={prompt}
        copied={copied}
        onClose={() => setDetailOpen(false)}
        onCopy={copy}
        onShare={prompt.is_public ? share : undefined}
        onEdit={prompt.own ? openEdit : undefined}
      />
      <FillVariablesModal open={showVars} content={prompt.content} onClose={() => setShowVars(false)} />
    </>
  );
}
