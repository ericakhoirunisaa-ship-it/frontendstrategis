"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, BarChart2, Image as ImageIcon, Calendar, FileText, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { indikatorApi, infografisApi, jadwalApi } from "@/lib/api";

interface SearchResult {
  id: string;
  type: "indikator" | "infografis" | "jadwal" | "halaman";
  title: string;
  subtitle?: string;
  href: string;
}

const HALAMAN_STATIS: SearchResult[] = [
  { id: "h-beranda",    type: "halaman", title: "Beranda",             subtitle: "Halaman utama SITARA",                href: "/" },
  { id: "h-data",       type: "halaman", title: "Data Strategis",      subtitle: "Grafik dan tabel indikator",          href: "/data-strategis" },
  { id: "h-indikator",  type: "halaman", title: "Ringkasan Indikator", subtitle: "Indikator bulanan Kab. Toli-Toli",    href: "/indikator-bulanan" },
  { id: "h-portal",     type: "halaman", title: "Portal Daerah",       subtitle: "Dataset OPD Kabupaten Toli-Toli",     href: "/portal-daerah" },
  { id: "h-infografis", type: "halaman", title: "Infografis",          subtitle: "Visualisasi data statistik",          href: "/infografis" },
  { id: "h-jadwal",     type: "halaman", title: "Jadwal Rilis",        subtitle: "Kalender publikasi BPS",              href: "/jadwal-rilis" },
  { id: "h-layanan",    type: "halaman", title: "Layanan Konsultasi",  subtitle: "Konsultasi dan permintaan data",      href: "/layanan-konsultasi" },
];

const TYPE_CONFIG = {
  indikator: { label: "Indikator",    icon: BarChart2,  color: "#1D6FCA" },
  infografis: { label: "Infografis",  icon: ImageIcon,  color: "#059669" },
  jadwal:     { label: "Jadwal Rilis",icon: Calendar,   color: "#D97706" },
  halaman:    { label: "Halaman",     icon: FileText,   color: "#7C3AED" },
} as const;

export function openSearch() {
  document.dispatchEvent(new CustomEvent("sitara:open-search"));
}

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [allData, setAllData] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const fetchAll = useCallback(async () => {
    if (allData.length > 0) return;
    setLoading(true);
    try {
      const [indRes, infRes, jadRes] = await Promise.allSettled([
        indikatorApi.getAll(),
        infografisApi.getAll(),
        jadwalApi.getAll(),
      ]);
      const results: SearchResult[] = [...HALAMAN_STATIS];
      if (indRes.status === "fulfilled") {
        for (const ind of indRes.value.data) {
          results.push({
            id: `ind-${ind.id}`,
            type: "indikator",
            title: ind.nama,
            subtitle: ind.kategori,
            href: "/data-strategis",
          });
        }
      }
      if (infRes.status === "fulfilled") {
        for (const inf of infRes.value.data) {
          results.push({
            id: `inf-${inf.id}`,
            type: "infografis",
            title: inf.judul,
            subtitle: inf.deskripsi || "Infografis BPS",
            href: "/infografis",
          });
        }
      }
      if (jadRes.status === "fulfilled") {
        for (const j of jadRes.value.data) {
          results.push({
            id: `jad-${j.id}`,
            type: "jadwal",
            title: j.judul,
            subtitle: j.tanggal ? `Rilis: ${j.tanggal}` : undefined,
            href: "/jadwal-rilis",
          });
        }
      }
      setAllData(results);
    } finally {
      setLoading(false);
    }
  }, [allData.length]);

  const handleOpen = useCallback(() => {
    setOpen(true);
    setQuery("");
  }, []);

  useEffect(() => {
    document.addEventListener("sitara:open-search", handleOpen);
    return () => document.removeEventListener("sitara:open-search", handleOpen);
  }, [handleOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        handleOpen();
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [handleOpen]);

  useEffect(() => {
    if (open) {
      fetchAll();
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open, fetchAll]);

  const filtered = query.trim().length < 1
    ? allData.slice(0, 8)
    : allData
        .filter((r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          (r.subtitle || "").toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 12);

  const grouped = new Map<string, SearchResult[]>();
  for (const r of filtered) {
    if (!grouped.has(r.type)) grouped.set(r.type, []);
    grouped.get(r.type)!.push(r);
  }

  const handleSelect = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] px-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div className="w-full max-w-lg bg-white dark:bg-[#0F1825] rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700/50 animate-in fade-in slide-in-from-top-4 duration-200">

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-700/50">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari indikator, infografis, jadwal rilis..."
            className="flex-1 text-sm bg-transparent text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
          />
          <div className="flex items-center gap-2 shrink-0">
            <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700">
              Esc
            </kbd>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hasil */}
        <div className="max-h-[55vh] overflow-y-auto py-2">
          {loading && (
            <p className="text-center text-sm text-slate-400 py-10">Memuat data...</p>
          )}

          {!loading && filtered.length === 0 && query.trim().length > 0 && (
            <div className="text-center py-10">
              <Search className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">
                Tidak ada hasil untuk &ldquo;<span className="font-medium">{query}</span>&rdquo;
              </p>
            </div>
          )}

          {!loading && [...grouped.entries()].map(([type, items]) => {
            const cfg = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG];
            const Icon = cfg.icon;
            return (
              <div key={type} className="mb-1">
                <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {cfg.label}
                </p>
                {items.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelect(r.href)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left group"
                  >
                    <span
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: cfg.color + "18" }}
                    >
                      <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-slate-800 dark:text-white truncate">
                        {r.title}
                      </span>
                      {r.subtitle && (
                        <span className="block text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {r.subtitle}
                        </span>
                      )}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0 group-hover:text-slate-400 transition-colors" />
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-700/50 flex items-center gap-2">
          <kbd className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700">
            Ctrl
          </kbd>
          <kbd className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700">
            K
          </kbd>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">untuk membuka pencarian kapan saja</span>
        </div>
      </div>
    </div>
  );
}
