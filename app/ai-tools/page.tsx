"use client";

import { useState } from "react";
import Link from "next/link";
import AIPromptActions from "@/components/AIPromptActions";

const examplePrompt = "Help me write a friendly email to announce a new feature to our customers.";

export default function AIToolsPage() {
  const [prompt, setPrompt] = useState(examplePrompt);

  return (
    <main className="min-h-screen bg-[#091012] px-4 py-10 text-white sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-cyan-200/70 hover:text-cyan-100">← Prompt Library</Link>
        <header className="mb-8 mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">AI workspace</p>
          <h1 className="mt-2 text-3xl font-semibold">Shape a better prompt</h1>
          <p className="mt-2 text-sm text-white/55">Improve, organize, and explore variations of a prompt.</p>
        </header>

        <label htmlFor="prompt" className="mb-2 block text-sm font-medium text-white/80">Your prompt</label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={6}
          maxLength={20000}
          className="mb-2 w-full resize-y rounded-lg border border-white/15 bg-white/[0.04] p-4 text-sm leading-relaxed outline-none transition focus:border-cyan-300/60"
        />
        <p className="mb-5 text-right text-xs text-white/40">{prompt.length} / 20,000</p>
        <AIPromptActions prompt={prompt} onApplyImprovedPrompt={setPrompt} />
      </div>
    </main>
  );
}