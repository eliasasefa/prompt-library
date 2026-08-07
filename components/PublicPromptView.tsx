"use client";

import { useState } from "react";
import { ArrowLeft, Copy, Sparkles } from "lucide-react";
import Link from "next/link";
import FillVariablesModal from "./FillVariablesModal";

export default function PublicPromptView({ prompt }: { prompt: any }) {
  const [showVars, setShowVars] = useState(false);
  const hasVars = /\{\{([^}]+)\}\}/.test(prompt.content);

  function handleCopy() {
    if (hasVars) {
      setShowVars(true);
    } else {
      navigator.clipboard.writeText(prompt.content);
      alert("Copied!");
    }
  }

  return (
    <div className="min-h-screen bg-[#07070b] text-white p-6">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-white/50 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Library
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          <div className="mb-6 flex items-center gap-3">
             <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <Sparkles className="h-5 w-5 text-white" />
            </span>
            <div>
              <h1 className="text-2xl font-bold">{prompt.title}</h1>
              <p className="text-sm text-white/50">By {prompt.author} • {prompt.category || "Uncategorized"}</p>
            </div>
          </div>

          <pre className="mb-6 overflow-x-auto whitespace-pre-wrap rounded-xl bg-black/40 p-6 font-mono text-sm leading-relaxed text-white/80">
            {prompt.content}
          </pre>

          <button
            onClick={handleCopy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
          >
            <Copy className="h-4 w-4" /> Copy Prompt
          </button>
        </div>
      </div>
      
      <FillVariablesModal open={showVars} content={prompt.content} onClose={() => setShowVars(false)} />
    </div>
  );
}