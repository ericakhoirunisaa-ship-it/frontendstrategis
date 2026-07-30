"use client";
import { Search } from "lucide-react";

export default function HeroSearch() {
  return (
    <button
      onClick={() => document.dispatchEvent(new CustomEvent("sitara:open-search"))}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/20 bg-white/8 hover:bg-white/12 transition-colors text-left mt-6"
      style={{ backdropFilter: "blur(4px)" }}
    >
      <Search className="w-4 h-4 text-white/50 shrink-0" />
      <span className="text-white/45 text-sm">Cari indikator, infografis, jadwal rilis...</span>
      <kbd className="ml-auto hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white/35 border border-white/15 shrink-0">
        Ctrl K
      </kbd>
    </button>
  );
}
