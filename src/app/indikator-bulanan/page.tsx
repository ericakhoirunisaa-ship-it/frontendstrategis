"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { indikatorBulananApi } from "@/lib/api";
import { TrendingUp, TrendingDown, Minus, BarChart2, ChevronLeft, ChevronRight } from "lucide-react";

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

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-sm border transition-all hover:-translate-y-0.5 hover:shadow-md"
      style={{ borderColor: w.border, background: w.soft }}
    >
      {/* Colored header */}
      <div className="px-4 py-3" style={{ background: w.bg }}>
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
  const [availPeriodes, setAvailPeriodes] = useState<{ bulan: number; tahun: number }[]>([]);

  // Load available periods once
  useEffect(() => {
    indikatorBulananApi.getAll()
      .then((r) => {
        const data: IndikatorBulanan[] = r.data;
        const seen = new Set<string>();
        const periods: { bulan: number; tahun: number }[] = [];
        data.forEach((d) => {
          const key = `${d.tahun}-${d.bulan}`;
          if (!seen.has(key)) { seen.add(key); periods.push({ bulan: d.bulan, tahun: d.tahun }); }
        });
        periods.sort((a, b) => b.tahun - a.tahun || b.bulan - a.bulan);
        setAvailPeriodes(periods);
        // Set to latest available period if current month has no data
        if (periods.length > 0) {
          const hasCurrent = periods.some((p) => p.bulan === def.bulan && p.tahun === def.tahun);
          if (!hasCurrent) { setBulan(periods[0].bulan); setTahun(periods[0].tahun); }
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLoading(true);
    indikatorBulananApi.getAll(bulan, tahun)
      .then((r) => setItems(r.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [bulan, tahun]);

  const currentIdx = availPeriodes.findIndex((p) => p.bulan === bulan && p.tahun === tahun);
  const hasPrev = currentIdx < availPeriodes.length - 1;
  const hasNext = currentIdx > 0;

  const goPrev = () => {
    if (hasPrev) { const p = availPeriodes[currentIdx + 1]; setBulan(p.bulan); setTahun(p.tahun); }
  };
  const goNext = () => {
    if (hasNext) { const p = availPeriodes[currentIdx - 1]; setBulan(p.bulan); setTahun(p.tahun); }
  };

  const tahunOptions = Array.from(new Set(availPeriodes.map((p) => p.tahun))).sort((a, b) => b - a);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120]">
      <Navbar />

      {/* Page header */}
      <div className="bg-white dark:bg-[#0F1825] border-b border-slate-100 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
            <BarChart2 className="w-3.5 h-3.5" /> Indikator Bulanan
          </span>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#0C2340] dark:text-white mb-1">
                Indikator Bulanan Kabupaten Toli-Toli
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Ringkasan indikator statistik pilihan periode{" "}
                <span className="font-semibold text-[#1D6FCA]">
                  {BULAN_LABEL[bulan]} {tahun}
                </span>
              </p>
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
                {(tahunOptions.length > 0 ? tahunOptions : [tahun]).map((t) => (
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
            {availPeriodes.length > 0 && (
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                Coba pilih periode lain di atas.
              </p>
            )}
          </div>
        ) : (
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
