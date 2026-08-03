import { signIn } from "@/auth";
import { Copy, FolderOpen, Lock, Search, Sparkles } from "lucide-react";

const features = [
  { icon: FolderOpen, title: "Organize", desc: "Group prompts into your own categories." },
  { icon: Search, title: "Instant search", desc: "Find any prompt by keyword in milliseconds." },
  { icon: Copy, title: "One-click copy", desc: "Send any prompt straight to your clipboard." },
  { icon: Lock, title: "Public or private", desc: "Keep prompts secret or share with everyone." },
];
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58 0-.28-.01-1.02-.02-2-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.19.69.8.58A12 12 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-fuchsia-600/10 blur-3xl" />

      <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          PromptVault
        </div>
        <SignInButton />
      </nav>

      <main className="relative mx-auto max-w-4xl px-4 pb-24 pt-20 text-center sm:pt-28">
        <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
          No AI API keys needed — just your prompts
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
          Your personal{" "}
          <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            AI prompt library
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-white/50">
          Save, categorize, search and copy your best prompts in one beautiful place.
          Keep them private or share them with the community.
        </p>
        <div className="mt-8 flex justify-center">
          <SignInButton large />
        </div>

        <div className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left">
              <f.icon className="h-5 w-5 text-violet-400" />
              <h3 className="mt-3 text-sm font-semibold">{f.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-white/40">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function SignInButton({ large }: { large?: boolean }) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("github");
      }}
    >
      <button
        className={`flex items-center gap-2 rounded-xl font-medium transition hover:opacity-90 ${
          large
            ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-white shadow-xl shadow-violet-500/30"
            : "border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
        }`}
      >
       <GithubIcon className="h-4 w-4" />
        Continue with GitHub
      </button>
    </form>
  );
}