"use client";

import { useState } from "react";
import { Check, Copy, LoaderCircle, Sparkles, X } from "lucide-react";
import { useAI } from "@/lib/hooks/useAI";

type Props = {
  prompt: string;
  onApplyPrompt?: (value: string) => void;
};

type Result =
  | { type: "improve"; value: Awaited<ReturnType<ReturnType<typeof useAI>["improvePrompt"]>> }
  | { type: "categorize"; value: Awaited<ReturnType<ReturnType<typeof useAI>["categorizePrompt"]>> }
  | { type: "describe"; value: Awaited<ReturnType<ReturnType<typeof useAI>["describePrompt"]>> }
  | { type: "similar"; value: Awaited<ReturnType<ReturnType<typeof useAI>["generateSimilarPrompts"]>> }
  | { type: "issues"; value: Awaited<ReturnType<ReturnType<typeof useAI>["detectPromptIssues"]>> };

const actions = [
  { id: "improve", label: "Improve", hint: "Rewrite for clarity" },
  { id: "categorize", label: "Tags", hint: "Suggest category and tags" },
  { id: "describe", label: "Describe", hint: "Summarize the prompt" },
  { id: "similar", label: "Variations", hint: "Generate alternatives" },
  { id: "issues", label: "Review", hint: "Check for weak spots" },
] as const;

export default function AIPromptActions({ prompt, onApplyPrompt }: Props) {
  const ai = useAI();
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function runAction(action: (typeof actions)[number]["id"]) {
    setResult(null);
    setCopied(null);
    try {
      switch (action) {
        case "improve":
          setResult({ type: "improve", value: await ai.improvePrompt(prompt) });
          break;
        case "categorize":
          setResult({ type: "categorize", value: await ai.categorizePrompt(prompt) });
          break;
        case "describe":
          setResult({ type: "describe", value: await ai.describePrompt(prompt) });
          break;
        case "similar":
          setResult({ type: "similar", value: await ai.generateSimilarPrompts(prompt) });
          break;
        case "issues":
          setResult({ type: "issues", value: await ai.detectPromptIssues(prompt) });
          break;
      }
    } catch {
      /* useAI already stores the error */
    }
  }

  async function copy(text: string, key = "main") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied((current) => (current === key ? null : current)), 1800);
    } catch {
      setCopied(null);
    }
  }

  function apply(value: string) {
    setCopied(null);
    setResult(null);
    onApplyPrompt?.(value);
  }

  const loadingLabel = actions.find(({ id }) => id === ai.loading)?.label;
  const canApply = Boolean(onApplyPrompt);

  return (
    <section className="space-y-3" aria-label="AI prompt tools">
      <div className="flex flex-wrap gap-2">
        {actions.map(({ id, label, hint }) => (
          <button
            key={id}
            type="button"
            title={hint}
            onClick={() => runAction(id)}
            disabled={!prompt.trim() || ai.loading !== null}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/75 transition hover:border-violet-400/40 hover:bg-violet-500/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {ai.loading === id ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-violet-300" />
            )}
            {label}
          </button>
        ))}
      </div>

      {ai.loading && (
        <p className="text-xs text-white/40" aria-live="polite">
          {loadingLabel}… this usually takes a few seconds.
        </p>
      )}

      {ai.error && (
        <p role="alert" className="rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
          {ai.error}
        </p>
      )}

      {result && (
        <div className="overflow-hidden rounded-xl border border-violet-500/20 bg-violet-500/[0.06]">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
            <p className="flex items-center gap-2 text-xs font-medium text-violet-200">
              <Sparkles className="h-3.5 w-3.5" />
              Suggested {actions.find(({ id }) => id === result.type)?.label.toLowerCase()}
            </p>
            <button
              type="button"
              onClick={() => setResult(null)}
              className="rounded-md p-1 text-white/40 hover:bg-white/10 hover:text-white"
              aria-label="Dismiss suggestion"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 p-4">
            {result.type === "improve" && (
              <ImproveResult
                improved={result.value.improved}
                suggestions={result.value.suggestions}
                clarity={result.value.clarity_score}
                specificity={result.value.specificity_score}
                copied={copied === "main"}
                canApply={canApply}
                onCopy={() => copy(result.value.improved)}
                onApply={() => apply(result.value.improved)}
              />
            )}

            {result.type === "similar" && (
              <ul className="space-y-3">
                {result.value.prompts.map((item, index) => (
                  <li key={`${index}-${item.slice(0, 40)}`} className="rounded-lg border border-white/10 bg-black/20 p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-white/35">
                      Version {index + 1}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/85">{item}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {canApply && (
                        <ApplyButton onClick={() => apply(item)} label="Use this version" />
                      )}
                      <CopyButton copied={copied === `similar-${index}`} onClick={() => copy(item, `similar-${index}`)} />
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {result.type === "categorize" && (
              <div className="space-y-3">
                <p className="text-sm text-white/80">
                  {result.value.category}{" "}
                  <span className="text-white/45">({Math.round(result.value.confidence * 100)}% confidence)</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.value.tags.map((tag) => (
                    <span key={tag} className="rounded-md border border-violet-300/20 bg-violet-300/10 px-2 py-1 text-xs text-violet-100">
                      {tag}
                    </span>
                  ))}
                </div>
                <CopyButton
                  copied={copied === "main"}
                  onClick={() => copy(`${result.value.category}: ${result.value.tags.join(", ")}`)}
                />
              </div>
            )}

            {result.type === "describe" && (
              <div className="space-y-3">
                <p className="text-sm leading-relaxed text-white/80">{result.value.description}</p>
                <CopyButton copied={copied === "main"} onClick={() => copy(result.value.description)} />
              </div>
            )}

            {result.type === "issues" && (
              <div className="space-y-3">
                {result.value.issues.length ? (
                  <ul className="list-inside list-disc space-y-2 text-sm text-white/75">
                    {result.value.issues.map((issue, index) => (
                      <li key={`${index}-${issue}`}>{issue}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-emerald-200">No significant issues detected.</p>
                )}
                {!!result.value.issues.length && (
                  <CopyButton copied={copied === "main"} onClick={() => copy(result.value.issues.join("\n"))} />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function ImproveResult({
  improved,
  suggestions,
  clarity,
  specificity,
  copied,
  canApply,
  onCopy,
  onApply,
}: {
  improved: string;
  suggestions: string[];
  clarity: number;
  specificity: number;
  copied: boolean;
  canApply: boolean;
  onCopy: () => void;
  onApply: () => void;
}) {
  return (
    <div className="space-y-3">
      <p className="whitespace-pre-wrap rounded-lg border border-white/10 bg-black/25 p-3 font-mono text-sm leading-relaxed text-white/90">
        {improved}
      </p>
      <p className="text-xs text-white/45">
        Clarity {clarity}/10 · Specificity {specificity}/10
      </p>
      {!!suggestions.length && (
        <ul className="list-inside list-disc space-y-1 text-xs text-white/55">
          {suggestions.map((item, index) => (
            <li key={`${index}-${item}`}>{item}</li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        {canApply && <ApplyButton onClick={onApply} label="Replace prompt" />}
        <CopyButton copied={copied} onClick={onCopy} />
      </div>
    </div>
  );
}

function ApplyButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg bg-violet-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-400"
    >
      {label}
    </button>
  );
}

function CopyButton({ copied, onClick }: { copied: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/75 hover:bg-white/10"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
