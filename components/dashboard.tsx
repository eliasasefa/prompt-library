"use client";

import { useCallback, useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { Compass, Library, Loader2, LogOut, Plus, Search, Sparkles } from "lucide-react";
import { Category, Prompt } from "@/lib/types";
import Sidebar from "./sidebar";
import PromptCard from "./PromptCard";
import PromptModal from "./PromptModal";

type PromptInput = {
  title: string;
  content: string;
  categoryId: number | null;
  isPublic: boolean;
};

export default function Dashboard({ session }: { session: Session }) {
  const [scope, setScope] = useState<"mine" | "explore">("mine");
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [input, setInput] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Prompt | null>(null);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => setQ(input.trim()), 250);
    return () => clearTimeout(t);
  }, [input]);

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) setCategories(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadPrompts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ scope });
      if (q) params.set("q", q);
      if (scope === "mine" && activeCategory !== "all") params.set("category", activeCategory);
      const res = await fetch(`/api/prompts?${params}`);
      if (res.ok) setPrompts(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [scope, q, activeCategory]);

  useEffect(() => { loadPrompts(); }, [loadPrompts]);
  useEffect(() => { loadCategories(); }, [loadCategories]);

  const refresh = () => Promise.all([loadPrompts(), loadCategories()]);

  async function handleSave(data: PromptInput, id?: number) {
    const res = await fetch(id ? `/api/prompts/${id}` : "/api/prompts", {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.text()) || "Save failed");
    setModalOpen(false);
    setEditing(null);
    await refresh();
  }

  async function handleDelete(p: Prompt) {
    if (!window.confirm(`Delete "${p.title}"?`)) return;
    await fetch(`/api/prompts/${p.id}`, { method: "DELETE" });
    await refresh();
  }

  async function handleToggleVisibility(p: Prompt) {
    await fetch(`/api/prompts/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: !p.is_public }),
    });
    await loadPrompts();
  }

  async function handleAddCategory(name: string) {
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    await loadCategories();
  }

  async function handleRemoveCategory(id: number) {
    if (!window.confirm("Delete this category? Its prompts become uncategorized.")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (activeCategory === String(id)) setActiveCategory("all");
    await refresh();
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07070b]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <a href="/" className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30">
              <Sparkles className="h-4 w-4 text-white" />
            </span>
            PromptVault
          </a>

          <div className="relative order-last w-full sm:order-none sm:w-auto sm:max-w-lg sm:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={scope === "mine" ? "Search your prompts…" : "Search public prompts…"}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-white/30 focus:border-violet-500/50 focus:bg-black/40"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="flex rounded-full border border-white/10 bg-white/5 p-1 text-xs">
              <button
                onClick={() => setScope("mine")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${
                  scope === "mine" ? "bg-violet-500 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                <Library className="h-3.5 w-3.5" /> My Library
              </button>
              <button
                onClick={() => setScope("explore")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${
                  scope === "explore" ? "bg-violet-500 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                <Compass className="h-3.5 w-3.5" /> Explore
              </button>
            </div>

            {session.user?.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name ?? "avatar"}
                className="h-8 w-8 rounded-full border border-white/10"
              />
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              title="Sign out"
              className="rounded-lg p-2 text-white/50 transition hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        {scope === "mine" && (
          <Sidebar
            categories={categories}
            active={activeCategory}
            onSelect={setActiveCategory}
            onAdd={handleAddCategory}
            onRemove={handleRemoveCategory}
          />
        )}

        <main className="min-w-0 flex-1">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold">
                {scope === "mine" ? "My Library" : "Explore public prompts"}
              </h1>
              <p className="text-xs text-white/40">
                {loading ? "Loading…" : `${prompts.length} prompt${prompts.length === 1 ? "" : "s"}`}
              </p>
            </div>
            <button
              onClick={() => { setEditing(null); setModalOpen(true); }}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> New prompt
            </button>
          </div>

          {/* Mobile category chips */}
          {scope === "mine" && (
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              <Chip active={activeCategory === "all"} onClick={() => setActiveCategory("all")}>All</Chip>
              {categories.map((c) => (
                <Chip
                  key={c.id}
                  active={activeCategory === String(c.id)}
                  onClick={() => setActiveCategory(String(c.id))}
                >
                  {c.name}
                </Chip>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-6 w-6 animate-spin text-white/30" />
            </div>
          ) : prompts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center">
              <p className="text-white/60">
                {q
                  ? "No prompts match your search."
                  : scope === "explore"
                  ? "No public prompts yet — be the first to share one!"
                  : "Your library is empty."}
              </p>
              {!q && scope === "mine" && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="mt-4 rounded-xl bg-violet-500/15 px-4 py-2 text-sm text-violet-300 hover:bg-violet-500/25"
                >
                  Save your first prompt
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {prompts.map((p) => (
                <PromptCard
                  key={p.id}
                  prompt={p}
                  onEdit={() => { setEditing(p); setModalOpen(true); }}
                  onDelete={() => handleDelete(p)}
                  onToggleVisibility={() => handleToggleVisibility(p)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <PromptModal
        open={modalOpen}
        editing={editing}
        categories={categories}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
      />
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition ${
        active
          ? "border-violet-500/50 bg-violet-500/15 text-violet-200"
          : "border-white/10 bg-white/5 text-white/60"
      }`}
    >
      {children}
    </button>
  );
}