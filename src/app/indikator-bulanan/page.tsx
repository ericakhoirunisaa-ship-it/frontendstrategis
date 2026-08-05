"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { indikatorBulananApi } from "@/lib/api";
import { TrendingUp, TrendingDown, Minus, BarChart2, ChevronLeft, ChevronRight, Zap } from "lucide-react";

interface IndikatorBulanan {
  id: number;
  judul: string;
  nilai: string;
  satuan?: string;
  perubahan?: string;
  arahPerubahan?: string;
  keterangan?: string;
  periode?: string;
  warna: string;
  urutan: number;
  bulan: number;
  tahun: number;
  sumber?: "manual" | "strategis";
}

const WARNA_MAP: Record<string, { bg: string; text: string; soft: string; border: string }> = {
  biru:   { bg: "#1D6FCA", text: "#fff", soft: "#EFF6FF", border: "#BFDBFE" },
  oranye: { bg: "#EA580C", text: "#fff", soft: "#FFF7ED", border: "#FED7AA" },
  hijau:  { bg: "#059669", text: "#fff", soft: "#F0FDF4", border: "#A7F3D0" },
  merah:  { bg: "#DC2626", text: "#fff", soft: "#FEF2F2", border: "#FECACA" },
  ungu:   { bg: "#7C3AED", text: "#fff", soft: "#F5F3FF", border: "#DDD6FE" },
  kuning: { bg: "#D97706", text: "#fff", soft: "#FFFBEB", border: "#FDE68A" },
};

const BULAN_LABEL = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function getDefaultPeriode() {
  const now = new Date();
  return { bulan: now.getMonth() + 1, tahun: now.getFullYear() };
}

function StatCard({ item }: { item: IndikatorBulanan }) {
  const w = WARNA_MAP[item.warna] ?? WARNA_MAP.biru;
  const naik = item.arahPerubahan === "naik";
  const turun = item.arahPerubahan === "turun";
  const isAuto = item.sumber === "strategis";

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-sm border transition-all hover:-translate-y-0.5 hover:shadow-md relative"
      style={{ borderColor: w.border, background: w.soft }}
    >
      {/* Auto badge */}
      {isAuto && (
        <span
          className="absolute top-2 right-2 z-10 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
          style={{ background: "rgba(255,255,255,0.85)", color: w.bg }}
          title="Data otomatis dari Indikator Strategis"
        >
          <Zap className="w-2.5 h-2.5" />
          Auto
        </span>
      )}

      {/* Colored header */}
      <div className="px-4 py-3 pr-14" style={{ background: w.bg }}>
        <p className="text-white/80 text-[11px] font-semibold uppercase tracking-wider line-clamp-2 leading-tight">
          {item.judul}
        </p>
      </div>

      {/* Body */}
      <div className="px-4 py-4">
        {/* Big value */}
        <div className="flex items-end gap-1.5">
          <span className="text-3xl font-extrabold text-[#0C2340] dark:text-white leading-none">
            {item.nilai}
          </span>
          {item.satuan && (
            <span className="text-xs font-semibold text-slate-400 mb-0.5">{item.satuan}</span>
          )}
        </div>

        {/* Change */}
        {item.perubahan && (
          <div className="flex items-center gap-1 mt-2">
            {naik ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : turun ? (
              <TrendingDown className="w-3.5 h-3.5 text-red-500 shrink-0" />
            ) : (
              <Minus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            <span
              className={`text-xs font-semibold ${
                naik ? "text-emerald-600" : turun ? "text-red-500" : "text-slate-500"
              }`}
            >
              {item.perubahan}
            </span>
          </div>
        )}

        {/* Keterangan / periode */}
        {(item.keterangan || item.periode) && (
          <p className="text-[11px] text-slate-400 mt-2 leading-snug">
            {item.keterangan ?? item.periode}
          </p>
        )}
      </div>
    </div>
  );
}

export default function IndikatorBulananPage() {
  const def = getDefaultPeriode();
  const [bulan, setBulan] = useState(def.bulan);
  const [tahun, setTahun] = useState(def.tahun);
  const [items, setItems] = useState<IndikatorBulanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [availTahun, setAvailTahun] = useState<number[]>([]);
  const [availPeriodes, setAvailPeriodes] = useState<{ bulan: number; tahun: number }[]>([]);

  // Load available tahun once (from manual entries + strategis years)
  useEffect(() => {
    Promise.all([
      indikatorBulananApi.getAll().catch(() => ({ data: [] })),
      indikatorBulananApi.getStrategisYears().catch(() => ({ data: { years: [] } })),
    ]).then(([manualRes, strategisRes]) => {
      const manualData: IndikatorBulanan[] = manualRes.data ?? [];
      const strategisYears: number[] = strategisRes.data?.years ?? [];

      // Collect periods from manual entries
      const seen = new Set<string>();
      const periods: { bulan: number; tahun: number }[] = [];
      manualData.forEach((d) => {
        const key = `${d.tahun}-${d.bulan}`;
        if (!seen.has(key)) { seen.add(key); periods.push({ bulan: d.bulan, tahun: d.tahun }); }
      });
      periods.sort((a, b) => b.tahun - a.tahun || b.bulan - a.bulan);
      setAvailPeriodes(periods);

      // Collect unique tahun from both sources
      const tahunSet = new Set<number>([
        ...manualData.map((d) => d.tahun),
        ...strategisYears,
        def.tahun, // always include current year
      ]);
      const sortedTahun = Array.from(tahunSet).sort((a, b) => b - a);
      setAvailTahun(sortedTahun);

      // If current month+year has no data, jump to most recent manual period
      const hasCurrent = periods.some((p) => p.bulan === def.bulan && p.tahun === def.tahun);
      const hasCurrentYear = strategisYears.includes(def.tahun);
      if (!hasCurrent && !hasCurrentYear && periods.length > 0) {
        setBulan(periods[0].bulan);
        setTahun(periods[0].tahun);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load combined data whenever bulan/tahun changes
  useEffect(() => {
    setLoading(true);
    indikatorBulananApi.getCombined(bulan, tahun)
      .then((r) => setItems(r.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [bulan, tahun]);

  // Period navigation (based on manual periods union strategis months)
  const allPeriods = (() => {
    const set = new Set<string>();
    const result: { bulan: number; tahun: number }[] = [];
    // Add all 12 months for each strategis year
    for (const t of availTahun) {
      for (let b = 12; b >= 1; b--) {
        const key = `${t}-${b}`;
        if (!set.has(key)) { set.add(key); result.push({ bulan: b, tahun: t }); }
      }
    }
    // Add manual periods not already covered
    for (const p of availPeriodes) {
      const key = `${p.tahun}-${p.bulan}`;
      if (!set.has(key)) { set.add(key); result.push(p); }
    }
    return result.sort((a, b) => b.tahun - a.tahun || b.bulan - a.bulan);
  })();

  const currentIdx = allPeriods.findIndex((p) => p.bulan === bulan && p.tahun === tahun);
  const hasPrev = currentIdx < allPeriods.length - 1;
  const hasNext = currentIdx > 0;

  const goPrev = () => {
    if (hasPrev) { const p = allPeriods[currentIdx + 1]; setBulan(p.bulan); setTahun(p.tahun); }
  };
  const goNext = () => {
    if (hasNext) { const p = allPeriods[currentIdx - 1]; setBulan(p.bulan); setTahun(p.tahun); }
  };

  const tahunOptions = availTahun.length > 0 ? availTahun : [tahun];
  const autoCount = items.filter((i) => i.sumber === "strategis").length;
  const manualCount = items.filter((i) => i.sumber === "manual").length;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120]">
      <Navbar />

      {/* Page header */}
      <div className="bg-white dark:bg-[#0F1825] border-b border-slate-100 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
            <BarChart2 className="w-3.5 h-3.5" /> Ringkasan Indikator
          </span>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#0C2340] dark:text-white mb-1">
                Ringkasan Indikator Kabupaten Toli-Toli
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Ringkasan indikator statistik pilihan periode{" "}
                <span className="font-semibold text-[#1D6FCA]">
                  {BULAN_LABEL[bulan]} {tahun}
                </span>
              </p>
              {/* Data source summary */}
              {!loading && items.length > 0 && (
                <div className="flex items-center gap-2 mt-1.5">
                  {autoCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                      <Zap className="w-3 h-3 text-blue-400" />
                      {autoCount} dari Indikator Strategis
                    </span>
                  )}
                  {autoCount > 0 && manualCount > 0 && (
                    <span className="text-slate-200 dark:text-slate-700 text-[10px]">•</span>
                  )}
                  {manualCount > 0 && (
                    <span className="text-[10px] text-slate-400">{manualCount} tambahan manual</span>
                  )}
                </div>
              )}
            </div>

            {/* Period navigation */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={goPrev}
                disabled={!hasPrev}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Bulan select */}
              <select
                value={bulan}
                onChange={(e) => setBulan(+e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-[#162133] text-sm text-[#0C2340] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((b) => (
                  <option key={b} value={b}>{BULAN_LABEL[b]}</option>
                ))}
              </select>

              {/* Tahun select */}
              <select
                value={tahun}
                onChange={(e) => setTahun(+e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-[#162133] text-sm text-[#0C2340] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700"
              >
                {tahunOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <button
                onClick={goNext}
                disabled={!hasNext}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="h-10 bg-slate-200 dark:bg-slate-700 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <BarChart2 className="w-14 h-14 text-slate-200 dark:text-slate-700 mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Belum ada data untuk periode {BULAN_LABEL[bulan]} {tahun}.
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
              Coba pilih periode lain di atas.
            </p>
          </div>
        ) : manualCount > 0 && autoCount > 0 ? (
          /* Both manual and strategis — show in separate sections */
          <>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Tambahan Manual
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
              {items.filter((i) => i.sumber === "manual").map((item) => (
                <StatCard key={item.id} item={item} />
              ))}
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-blue-400" />
              Dari Indikator Strategis {tahun}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {items.filter((i) => i.sumber === "strategis").map((item) => (
                <StatCard key={item.id} item={item} />
              ))}
            </div>
          </>
        ) : (
          /* Only one source — show flat grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((item) => (
              <StatCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
