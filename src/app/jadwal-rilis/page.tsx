"use client";
import { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { jadwalApi } from "@/lib/api";
import {
  BookOpen, FileText, ImageIcon, ExternalLink, Search, X,
  ChevronLeft, ChevronRight, CalendarDays,
} from "lucide-react";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isSameDay, isToday, addMonths, subMonths,
} from "date-fns";
import { id } from "date-fns/locale";

interface Jadwal {
  id: number;
  judul: string;
  tanggal: string;
  kategori: string;
  deskripsi?: string;
  link?: string;
  status: string;
}

const KATEGORI_META: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  Publikasi:  { icon: BookOpen,  color: "#1D6FCA", bg: "#EBF4FF" },
  BRS:        { icon: FileText,  color: "#059669", bg: "#ECFDF5" },
  Infografis: { icon: ImageIcon, color: "#7C3AED", bg: "#F5F3FF" },
};

const DEFAULT_META = { icon: CalendarDays, color: "#64748B", bg: "#F1F5F9" };

type Tab = "semua" | "upcoming" | "released";

function MiniCalendar({ jadwals }: { jadwals: Jadwal[] }) {
  const [current, setCurrent] = useState(new Date());
  const start = startOfMonth(current);
  const end   = endOfMonth(current);
  const days  = eachDayOfInterval({ start, end });
  const startWeekday = getDay(start);

  const getKat = (date: Date) => {
    const j = jadwals.find((jd) => isSameDay(new Date(jd.tanggal), date));
    return j ? (KATEGORI_META[j.kategori] || DEFAULT_META) : null;
  };

  return (
    <div className="bg-white dark:bg-[#162133] rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-5 w-full">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrent((c) => subMonths(c, 1))}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <p className="text-sm font-bold text-[#0C2340] dark:text-white capitalize">
          {format(current, "MMMM yyyy", { locale: id })}
        </p>
        <button
          onClick={() => setCurrent((c) => addMonths(c, 1))}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {["Min","Sen","Sel","Rab","Kam","Jum","Sab"].map((d) => (
          <div key={d} className="text-center text-[9px] font-bold text-slate-400 uppercase py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {[...Array(startWeekday)].map((_, i) => <div key={`pad-${i}`} />)}
        {days.map((day) => {
          const kat   = getKat(day);
          const today = isToday(day);
          return (
            <div key={day.toISOString()} className="relative flex items-center justify-center">
              <div
                className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  today ? "bg-[#0C2340] dark:bg-blue-600 text-white"
                  : kat  ? "text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
                style={kat && !today ? { backgroundColor: kat.color } : {}}
                title={kat ? jadwals.find((j) => isSameDay(new Date(j.tanggal), day))?.judul : undefined}
              >
                {format(day, "d")}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-slate-100 dark:border-slate-700/50 pt-3 space-y-1.5">
        {Object.entries(KATEGORI_META).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: val.color }} />
            <span className="text-[11px] text-slate-500 font-medium">{key}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0C2340]" />
          <span className="text-[11px] text-slate-500 font-medium">Hari ini</span>
        </div>
      </div>
    </div>
  );
}

export default function JadwalRilisPage() {
  const [items, setItems]   = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]       = useState<Tab>("semua");
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("semua");

  useEffect(() => {
    jadwalApi.getAll()
      .then((r) => setItems(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kategoriOptions = useMemo(() => {
    const all = [...new Set(items.map((i) => i.kategori))];
    return all;
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchTab =
        tab === "semua" ? true :
        tab === "upcoming" ? item.status !== "RELEASED" :
        item.status === "RELEASED";
      const matchKat   = kategori === "semua" || item.kategori === kategori;
      const matchSearch = !search.trim() ||
        item.judul.toLowerCase().includes(search.toLowerCase()) ||
        (item.deskripsi || "").toLowerCase().includes(search.toLowerCase());
      return matchTab && matchKat && matchSearch;
    });
  }, [items, tab, search, kategori]);

  const countUpcoming = items.filter((i) => i.status !== "RELEASED").length;
  const countReleased = items.filter((i) => i.status === "RELEASED").length;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120]">
      <Navbar />

      {/* Page header */}
      <div className="bg-white dark:bg-[#0F1825] border-b border-slate-100 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-[#1D6FCA] dark:text-blue-300 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
            <CalendarDays className="w-3.5 h-3.5" /> Jadwal Rilis
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0C2340] dark:text-white mb-1">
            Jadwal Rilis Publikasi BPS
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm">
            Daftar lengkap jadwal rilis publikasi, Berita Resmi Statistik (BRS), dan infografis BPS Kabupaten Toli-Toli.
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Kolom Kiri: Kalender + Ringkasan ── */}
          <div className="lg:w-64 shrink-0 space-y-4">
            <MiniCalendar jadwals={items} />

            {/* Ringkasan */}
            <div className="bg-white dark:bg-[#162133] rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-4 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ringkasan</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Total Jadwal</span>
                <span className="text-sm font-bold text-[#0C2340] dark:text-white">{items.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Akan Rilis</span>
                <span className="text-sm font-bold text-amber-600">{countUpcoming}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Sudah Rilis</span>
                <span className="text-sm font-bold text-emerald-600">{countReleased}</span>
              </div>
            </div>
          </div>

          {/* ── Kolom Kanan: Filter + List ── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari publikasi..."
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-[#162133] text-sm text-[#1A1A2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Kategori filter */}
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-[#162133] text-sm text-[#1A1A2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700"
              >
                <option value="semua">Semua Kategori</option>
                {kategoriOptions.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
              {([
                { key: "semua",    label: "Semua",       count: items.length },
                { key: "upcoming", label: "Akan Rilis",  count: countUpcoming },
                { key: "released", label: "Sudah Rilis", count: countReleased },
              ] as { key: Tab; label: string; count: number }[]).map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    tab === key
                      ? "bg-white dark:bg-[#162133] text-[#1D6FCA] shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  {label}
                  <span className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full ${
                    tab === key ? "bg-blue-50 dark:bg-blue-900/30 text-[#1D6FCA]" : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                  }`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* List */}
            {loading ? (
              <div className="space-y-2.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white dark:bg-[#162133] rounded-2xl border border-slate-100 dark:border-slate-700/50 py-16 text-center">
                <CalendarDays className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">
                  {search ? `Tidak ada hasil untuk "${search}"` : "Belum ada jadwal rilis."}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filtered.map((item) => {
                  const meta    = KATEGORI_META[item.kategori] || DEFAULT_META;
                  const Icon    = meta.icon;
                  const released = item.status === "RELEASED";

                  return (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-[#162133] rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow px-4 py-4 flex items-start gap-4"
                    >
                      {/* Tanggal */}
                      <div className="shrink-0 w-12 text-center pt-0.5">
                        <p className="text-xl font-extrabold text-[#0C2340] dark:text-white leading-none">
                          {format(new Date(item.tanggal), "d")}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                          {format(new Date(item.tanggal), "MMM yy", { locale: id })}
                        </p>
                      </div>

                      <div className="w-px self-stretch bg-slate-100 dark:bg-slate-700 shrink-0" />

                      {/* Ikon kategori */}
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: meta.bg }}
                      >
                        <Icon className="w-4 h-4" style={{ color: meta.color }} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#0C2340] dark:text-white leading-snug">
                          {item.judul}
                        </p>
                        {item.deskripsi && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                            {item.deskripsi}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: meta.bg, color: meta.color }}
                          >
                            {item.kategori}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            released
                              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                              : "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                          }`}>
                            {released ? "✓ Sudah Rilis" : "⏱ Akan Rilis"}
                          </span>
                        </div>
                      </div>

                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#1D6FCA] hover:border-[#1D6FCA] transition-colors mt-0.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Unduh
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <p className="text-xs text-slate-400 text-right">
                Menampilkan {filtered.length} dari {items.length} jadwal
              </p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
