"use client";

import { useState } from "react";
import { FolderOpen, Plus, X } from "lucide-react";
import { Category } from "@/lib/types";

export default function Sidebar({
  categories,
  active,
  onSelect,
  onAdd,
  onRemove,
}: {
  categories: Category[];
  active: string;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onRemove: (id: number) => void;
}) {
  const [name, setName] = useState("");
  const total = categories.reduce((sum, c) => sum + c.prompt_count, 0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim());
    setName("");
  }

  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <div className="sticky top-20 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
          <FolderOpen className="h-3.5 w-3.5" /> Categories
        </h2>
        <nav className="space-y-1">
          <Item active={active === "all"} onClick={() => onSelect("all")}>
            All prompts <Count n={total} />
          </Item>
          {categories.map((c) => (
            <div key={c.id} className="group/item relative">
              <Item active={active === String(c.id)} onClick={() => onSelect(String(c.id))}>
                {c.name} <Count n={c.prompt_count} />
              </Item>
              <button
                onClick={() => onRemove(c.id)}
                title="Delete category"
                className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded p-1 text-white/30 hover:bg-white/10 hover:text-red-400 group-hover/item:block"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </nav>

        <form onSubmit={submit} className="mt-4 flex gap-1.5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New category"
            maxLength={40}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-sm outline-none placeholder:text-white/25 focus:border-violet-500/50"
          />
          <button
            type="submit"
            title="Add category"
            className="rounded-lg bg-violet-500/20 px-2.5 text-violet-300 hover:bg-violet-500/30"
          >
            <Plus className="h-4 w-4" />
          </button>
        </form>
      </div>
    </aside>
  );
}

function Item({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
        active ? "bg-violet-500/15 text-violet-200" : "text-white/60 hover:bg-white/5 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function Count({ n }: { n: number }) {
  return <span className="text-xs text-white/30">{n}</span>;
}