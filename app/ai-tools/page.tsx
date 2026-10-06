"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, Undo2 } from "lucide-react";
import AIPromptActions from "@/components/AIPromptActions";

const examplePrompt = "Help me write a friendly email to announce a new feature to our customers.";

export default function AIToolsPage() {
  const [prompt, setPrompt] = useState(examplePrompt);
  const [previous, setPrevious] = useState<string | null>(null);
  const [aiSession, setAiSession] = useState(0);

  function applyPrompt(value: string) {
    setPrevious(prompt);
    setPrompt(value.slice(0, 20000));
    setAiSession((n) => n + 1);
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-white/50 hover:text-white">
          ← Prompt Library
        </Link>
        <header className="mb-8 mt-8">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
            <Sparkles className="h-3.5 w-3.5" /> AI workspace
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Shape a better prompt</h1>
          <p className="mt-2 text-sm text-white/55">Improve, organize, and explore variations of a prompt.</p>
        </header>

        <label htmlFor="prompt" className="mb-2 block text-sm font-medium text-white/80">
          Your prompt
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(event) => {
            setPrompt(event.target.value);
            setPrevious(null);
          }}
          rows={6}
          maxLength={20000}
          className={`mb-2 w-full resize-y rounded-xl border bg-white/[0.04] p-4 text-sm leading-relaxed outline-none transition ${
            previous != null ? "border-violet-400/60 ring-2 ring-violet-500/20" : "border-white/15 focus:border-violet-500/50"
          }`}
        />
        <p className="mb-3 text-right text-xs text-white/40">{prompt.length.toLocaleString()} / 20,000</p>

        {previous != null && (
          <div className="mb-4 flex flex-col gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0" />
              Replaced the prompt above.
            </span>
            <button
              type="button"
              onClick={() => {
                setPrompt(previous);
                setPrevious(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium hover:bg-emerald-400/15"
            >
              <Undo2 className="h-3.5 w-3.5" /> Undo
            </button>
          </div>
        )}

        <p className="mb-3 text-xs text-white/40">
          Replace prompt writes into the field above and hides the suggestion.
        </p>
        <AIPromptActions key={aiSession} prompt={prompt} onApplyPrompt={applyPrompt} />
      </div>
    </main>
  );
}
