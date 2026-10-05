"use client";

import { useState } from "react";
import { Check, Copy, LoaderCircle, Sparkles } from "lucide-react";
import { useAI } from "@/lib/hooks/useAI";

type Props = {
  prompt: string;
  onApplyImprovedPrompt?: (value: string) => void;
};

type Result =
  | { type: "improve"; value: Awaited<ReturnType<ReturnType<typeof useAI>["improvePrompt"]>> }
  | { type: "categorize"; value: Awaited<ReturnType<ReturnType<typeof useAI>["categorizePrompt"]>> }
  | { type: "describe"; value: Awaited<ReturnType<ReturnType<typeof useAI>["describePrompt"]>> }
  | { type: "similar"; value: Awaited<ReturnType<ReturnType<typeof useAI>["generateSimilarPrompts"]>> }
  | { type: "issues"; value: Awaited<ReturnType<ReturnType<typeof useAI>["detectPromptIssues"]>> };

const actions = [
  { id: "improve", label: "Improve" },
  { id: "categorize", label: "Suggest Tags" },
  { id: "describe", label: "Generate Description" },
  { id: "similar", label: "Generate Variations" },
  { id: "issues", label: "Check Issues" },
] as const;

export default function AIPromptActions({ prompt, onApplyImprovedPrompt }: Props) {
  const ai = useAI();
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  async function runAction(action: (typeof actions)[number]["id"]) {
    setResult(null);
    try {
      switch (action) {
        case "improve": setResult({ type: "improve", value: await ai.improvePrompt(prompt) }); break;
        case "categorize": setResult({ type: "categorize", value: await ai.categorizePrompt(prompt) }); break;
        case "describe": setResult({ type: "describe", value: await ai.describePrompt(prompt) }); break;
        case "similar": setResult({ type: "similar", value: await ai.generateSimilarPrompts(prompt) }); break;
        case "issues": setResult({ type: "issues", value: await ai.detectPromptIssues(prompt) }); break;
      }
    } catch {}
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function resultText() {
    if (!result) return "";
    switch (result.type) {
      case "improve": return result.value.improved;
      case "categorize": return `${result.value.category}: ${result.value.tags.join(", ")}`;
      case "describe": return result.value.description;
      case "similar": return result.value.prompts.join("\n\n");
      case "issues": return result.value.issues.length ? result.value.issues.join("\n") : "No significant issues detected.";
    }
  }

  const text = resultText();

  return (
    <section className="space-y-4" aria-label="AI prompt actions">
      <div className="flex flex-wrap gap-2">
        {actions.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => runAction(id)}
            disabled={!prompt.trim() || ai.loading !== null}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {ai.loading === id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {label}
          </button>
        ))}
      </div>

      {ai.error && (
        <p role="alert" className="rounded-lg border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          {ai.error}
        </p>
      )}

      {result && (
        <div className="space-y-4 rounded-xl border border-white/10 bg-[#10191b] p-4 sm:p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-cyan-200">
            <Sparkles className="h-4 w-4" />
            {actions.find(({ id }) => id === result.type)?.label}
          </div>

          {result.type === "improve" && (
            <>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/85">{result.value.improved}</p>
              <p className="text-xs text-white/50">Clarity {result.value.clarity_score}/10 · Specificity {result.value.specificity_score}/10</p>
              {!!result.value.suggestions.length && (
                <ul className="list-inside list-disc space-y-1 text-sm text-white/60">
                  {result.value.suggestions.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}
                </ul>
              )}
            </>
          )}
          {result.type === "categorize" && (
            <div className="space-y-3">
              <p className="text-sm text-white/80">{result.value.category} <span className="text-white/45">({Math.round(result.value.confidence * 100)}% confidence)</span></p>
              <div className="flex flex-wrap gap-2">
                {result.value.tags.map((tag) => <span key={tag} className="rounded-md border border-cyan-200/20 bg-cyan-200/10 px-2 py-1 text-xs text-cyan-100">{tag}</span>)}
              </div>
            </div>
          )}
          {result.type === "describe" && <p className="text-sm leading-relaxed text-white/75">{result.value.description}</p>}
          {result.type === "similar" && (
            <ol className="list-inside list-decimal space-y-2 text-sm leading-relaxed text-white/75">
              {result.value.prompts.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}
            </ol>
          )}
          {result.type === "issues" && (
            result.value.issues.length
              ? <ul className="list-inside list-disc space-y-2 text-sm text-white/75">{result.value.issues.map((issue, index) => <li key={`${index}-${issue}`}>{issue}</li>)}</ul>
              : <p className="text-sm text-emerald-200">No significant issues detected.</p>
          )}

          <div className="flex flex-wrap gap-2 border-t border-white/10 pt-3">
            <button type="button" onClick={() => copy(text)} className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-xs text-white/80 hover:bg-white/15">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button type="button" onClick={() => onApplyImprovedPrompt?.(text)} disabled={!onApplyImprovedPrompt} className="rounded-md bg-cyan-300 px-3 py-2 text-xs font-medium text-[#102023] hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40">
              Use This
            </button>
          </div>
        </div>
      )}
    </section>
  );
}