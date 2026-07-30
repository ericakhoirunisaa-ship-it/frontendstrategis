"use client";
import { Search } from "lucide-react";

export default function HeroSearch() {
  return (
    <button
      onClick={() => document.dispatchEvent(new CustomEvent("sitara:open-search"))}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-white/20 bg-white dark:bg-white/8 hover:bg-slate-50 dark:hover:bg-white/12 shadow-sm dark:shadow-none transition-colors text-left"
      style={{ backdropFilter: "blur(4px)" }}
    >
      <Search className="w-4 h-4 text-slate-400 dark:text-white/50 shrink-0" />
      <span className="text-slate-400 dark:text-white/45 text-sm">Cari indikator, infografis, jadwal rilis data...</span>
      <kbd className="ml-auto hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-white/35 border border-slate-200 dark:border-white/15 shrink-0">
        Ctrl K
      </kbd>
    </button>
  );
}
