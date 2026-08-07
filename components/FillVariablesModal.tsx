"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function FillVariablesModal({
  open,
  content,
  onClose,
}: {
  open: boolean;
  content: string;
  onClose: () => void;
}) {
  const [variables, setVariables] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      const regex = /\{\{([^}]+)\}\}/g;
      const matches = Array.from(content.matchAll(regex));
      const vars = Array.from(new Set(matches.map((m) => m[1].trim())));
      setVariables(vars);
      setValues(Object.fromEntries(vars.map((v) => [v, ""])));
    }
  }, [open, content]);

  if (!open) return null;

  function handleCopy() {
    let finalContent = content;
    for (const v of variables) {
      const regex = new RegExp(`\\{\\{\\s*${v}\\s*\\}\\}`, "g");
      finalContent = finalContent.replace(regex, values[v] || "");
    }
    navigator.clipboard.writeText(finalContent);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d0d15] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Fill in the variables</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          {variables.map((v) => (
            <div key={v}>
              <label className="mb-1 block text-xs font-medium uppercase text-violet-300">{v}</label>
              <input
                value={values[v]}
                onChange={(e) => setValues({ ...values, [v]: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-violet-500/50"
                placeholder={`Enter ${v}...`}
                autoFocus
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleCopy}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-2.5 text-sm font-semibold text-white shadow-lg"
        >
          Copy Final Prompt
        </button>
      </div>
    </div>
  );
}