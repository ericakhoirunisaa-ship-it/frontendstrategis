"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Search, Building2, Layers, Calendar, Clock, Eye,
  ChevronDown, Info, Loader2, AlertCircle,
  Users2, Heart, BookOpen, Leaf, Users, Fish,
  Wrench, Camera, TrendingUp, Wifi, Database,
} from "lucide-react";
import { portalDaerahApi } from "@/lib/api";
import { DINAS_LIST, TOPIK_LIST, type IconKey } from "./data";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Users2, Heart, BookOpen, Leaf, Users, Fish, Wrench, Camera, TrendingUp, Wifi, Database,
};

interface Dataset {
  id: number;
  judul: string;
  dinas: string;
  bidang: string;
  topik: string;
  tahunMulai: number;
  tahunAkhir: number;
  tanggalUpdate: string;
  dilihat: number;
  icon: string;
  iconBg: string;
  iconColor: string;
  updatedAt: string;
  _count: { rows: number };
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (diff === 0) return "Hari ini";
  if (diff === 1) return "Kemarin";
  if (diff < 7) return `${diff} hari yang lalu`;
  if (diff < 14) return "Seminggu yang lalu";
  if (diff < 30) return `${Math.floor(diff / 7)} minggu yang lalu`;
  if (diff < 60) return "Sebulan yang lalu";
  if (diff < 365) return `${Math.floor(diff / 30)} bulan yang lalu`;
  return `${Math.floor(diff / 365)} tahun yang lalu`;
}

export default function PortalDaerahPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDinas, setSelectedDinas] = useState("");
  const [selectedTopik, setSelectedTopik] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedDinas, setAppliedDinas] = useState("");
  const [appliedTopik, setAppliedTopik] = useState("");

  useEffect(() => {
    portalDaerahApi.getAll()
      .then((r) => setDatasets(r.data))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return datasets.filter((d) => {
      const matchSearch =
        !appliedSearch ||
        d.judul.toLowerCase().includes(appliedSearch.toLowerCase()) ||
        d.dinas.toLowerCase().includes(appliedSearch.toLowerCase());
      const matchDinas = !appliedDinas || d.dinas === appliedDinas;
      const matchTopik = !appliedTopik || d.topik === appliedTopik;
      return matchSearch && matchDinas && matchTopik;
    });
  }, [datasets, appliedSearch, appliedDinas, appliedTopik]);

  const handleCari = () => {
    setAppliedSearch(searchQuery);
    setAppliedDinas(selectedDinas);
    setAppliedTopik(selectedTopik);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F8FC] dark:bg-[#0B1120]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="lg:w-72 shrink-0 bg-white dark:bg-[#0F1825] border border-slate-200 dark:border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-[#1D6FCA]" />
              <h1 className="text-lg font-bold text-slate-800 dark:text-white">Dataset</h1>
            </div>
            <p className="text-sm text-[#1D6FCA] leading-relaxed">
              Himpunan data yang berbentuk tabel yang dapat diolah lebih lanjut, berasal dari informasi
              Organisasi Perangkat Daerah Pemerintah Kabupaten Toli-Toli.
            </p>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCari()}
              placeholder="Cari Dataset ..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F1825] text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D6FCA]/30 text-sm"
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <select
                  value={selectedDinas}
                  onChange={(e) => setSelectedDinas(e.target.value)}
                  className="w-full appearance-none px-4 py-3 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F1825] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1D6FCA]/30 text-sm"
                >
                  <option value="">-- Pilih Dinas/OPD --</option>
                  {DINAS_LIST.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative flex-1">
                <select
                  value={selectedTopik}
                  onChange={(e) => setSelectedTopik(e.target.value)}
                  className="w-full appearance-none px-4 py-3 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F1825] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1D6FCA]/30 text-sm"
                >
                  <option value="">-- Pilih Topik --</option>
                  {TOPIK_LIST.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              <button
                onClick={handleCari}
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#0D6B56] hover:bg-[#0a5a48] text-white font-semibold text-sm transition-colors shrink-0"
              >
                <Search className="w-4 h-4" />
                Cari
              </button>
            </div>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-7 h-7 animate-spin text-[#1D6FCA]" />
          </div>
        )}
        {loadError && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Gagal memuat data. Periksa koneksi backend.
          </div>
        )}

        {!loading && !loadError && (
          <>
            <div className="mb-6">
              <p className="text-base font-medium text-slate-600 dark:text-slate-300">
                <span className="font-bold text-slate-800 dark:text-white">{filtered.length}</span>{" "}
                <span className="text-[#1D6FCA]">Dataset ditemukan</span>
              </p>
              <hr className="mt-3 border-slate-200 dark:border-slate-700/50" />
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Search className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Dataset tidak ditemukan</p>
                <p className="text-slate-400 text-sm mt-1">Coba ubah kata kunci atau filter pencarian</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filtered.map((dataset) => {
                  const IconComp = ICON_MAP[dataset.icon] ?? Database;
                  return (
                    <Link key={dataset.id} href={`/portal-daerah/${dataset.id}`}>
                      <div className="bg-[#E8F5F2] dark:bg-[#0D2318] border border-teal-100 dark:border-teal-900/30 rounded-xl p-4 flex gap-4 hover:shadow-md transition-all cursor-pointer group">
                        <div className="flex flex-col items-center justify-between shrink-0 w-[90px]">
                          <div
                            className="w-[80px] h-[80px] rounded-xl flex items-center justify-center shadow-sm"
                            style={{ backgroundColor: dataset.iconBg }}
                          >
                            <IconComp
                              className="w-10 h-10"
                              style={{ color: dataset.iconColor }}
                            />
                          </div>
                          <span className="mt-2 flex items-center gap-1 border border-[#0D6B56] text-[#0D6B56] dark:border-teal-400 dark:text-teal-400 text-xs font-semibold px-2.5 py-1 rounded">
                            <Eye className="w-3 h-3" />
                            {dataset.dilihat.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-800 dark:text-white text-sm leading-snug group-hover:text-[#0D6B56] dark:group-hover:text-teal-400 transition-colors line-clamp-3 mb-2">
                            {dataset.judul}
                          </h3>
                          <div className="flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                            <Building2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span className="leading-tight">{dataset.dinas}</span>
                          </div>
                          <div className="flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
                            <Layers className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span>{dataset.bidang}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {dataset.tahunMulai} - {dataset.tahunAkhir}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {timeAgo(dataset.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
