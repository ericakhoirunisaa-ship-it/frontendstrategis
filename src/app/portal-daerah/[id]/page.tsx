"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Eye, Layers, Calendar, Download, Building2, ChevronDown,
  TableIcon, BarChart2, FileText, Home, Loader2, AlertCircle,
  Users2, Heart, BookOpen, Leaf, Users, Fish,
  Wrench, Camera, TrendingUp, Wifi, Database,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { portalDaerahApi } from "@/lib/api";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Users2, Heart, BookOpen, Leaf, Users, Fish, Wrench, Camera, TrendingUp, Wifi, Database,
};

const CHART_COLORS = [
  "#1D6FCA", "#059669", "#D97706", "#7C3AED", "#DC2626",
  "#0D9488", "#EA580C", "#0284C7",
];

type TabKey = "tabel" | "grafik" | "metadata";

interface RowData {
  id: number;
  data: Record<string, string | number>;
  urutan: number;
}

interface DatasetDetail {
  id: number;
  judul: string;
  dinas: string;
  bidang: string;
  topik: string;
  tahunMulai: number;
  tahunAkhir: number;
  deskripsi?: string;
  tanggalUpdate: string;
  dilihat: number;
  icon: string;
  iconBg: string;
  iconColor: string;
  columns: string[];
  rows: RowData[];
}

function formatNumber(val: string | number | undefined): string {
  if (val === undefined || val === null) return "";
  if (typeof val === "number") {
    if (Number.isInteger(val)) return val.toLocaleString("id-ID");
    return val.toLocaleString("id-ID", { maximumFractionDigits: 2 });
  }
  return String(val);
}

function downloadCSV(dataset: DatasetDetail) {
  const cols = dataset.columns;
  const header = cols.join(",");
  const rowLines = dataset.rows.map((r) =>
    cols.map((col) => {
      const val = r.data[col];
      if (typeof val === "string" && val.includes(",")) return `"${val}"`;
      return val ?? "";
    }).join(",")
  );
  const csv = [header, ...rowLines].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${dataset.judul.replace(/\s+/g, "_").substring(0, 60)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DatasetDetailPage() {
  const params = useParams<{ id: string }>();
  const [dataset, setDataset] = useState<DatasetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("tabel");
  const [downloadOpen, setDownloadOpen] = useState(false);

  useEffect(() => {
    const id = parseInt(params?.id ?? "0");
    if (!id) { setNotFound(true); setLoading(false); return; }

    portalDaerahApi.getById(id)
      .then((r) => setDataset(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));

    // increment view (fire-and-forget)
    portalDaerahApi.incrementView(id).catch(() => {});
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F8FC] dark:bg-[#0B1120]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1D6FCA]" />
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !dataset) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F8FC] dark:bg-[#0B1120]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-xl font-bold text-slate-700 dark:text-white mb-2">Dataset tidak ditemukan</p>
            <Link href="/portal-daerah" className="text-[#1D6FCA] hover:underline text-sm">
              ← Kembali ke Portal Daerah
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const IconComp = ICON_MAP[dataset.icon] ?? Database;

  const cols = Array.isArray(dataset.columns)
    ? (dataset.columns as string[])
    : [];

  const numericCols = cols.filter((col) => {
    const first = dataset.rows[0]?.data;
    return first && typeof first[col] === "number";
  });
  const labelCol = cols.find((col) => {
    const first = dataset.rows[0]?.data;
    return first && typeof first[col] === "string";
  }) ?? cols[0] ?? "";

  const chartCols = numericCols.slice(0, 3);
  const chartData = dataset.rows.slice(0, 10).map((r) => {
    const entry: Record<string, string | number> = {
      name: String(r.data[labelCol] ?? "").split(" ").slice(0, 2).join(" "),
    };
    chartCols.forEach((col) => { entry[col] = Number(r.data[col] ?? 0); });
    return entry;
  });

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "tabel", label: "Tabel", icon: <TableIcon className="w-4 h-4" /> },
    { key: "grafik", label: "Grafik", icon: <BarChart2 className="w-4 h-4" /> },
    { key: "metadata", label: "Metadata", icon: <FileText className="w-4 h-4" /> },
  ];

  const TableView = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 font-bold text-slate-700 dark:text-white text-base">
          <TableIcon className="w-4 h-4 text-[#0D6B56]" />
          Tabel Dataset
        </h2>
        <div className="relative">
          <button
            onClick={() => setDownloadOpen((o) => !o)}
            className="flex items-center gap-1.5 bg-[#0D6B56] hover:bg-[#0a5a48] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {downloadOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDownloadOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-[#0F1825] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 min-w-[140px]">
                <button
                  onClick={() => { downloadCSV(dataset); setDownloadOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <FileText className="w-4 h-4 text-[#0D6B56]" />
                  Unduh CSV
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#0D6B56] text-white">
              {cols.map((col) => (
                <th key={col} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataset.rows.map((row, i) => (
              <tr
                key={row.id}
                className={`border-t border-slate-100 dark:border-slate-700/50 ${
                  i % 2 === 0 ? "bg-white dark:bg-[#0F1825]" : "bg-slate-50/70 dark:bg-slate-800/20"
                }`}
              >
                {cols.map((col) => (
                  <td key={col} className="px-4 py-2.5 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {formatNumber(row.data[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F8FC] dark:bg-[#0B1120]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Title + breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white leading-tight max-w-2xl">
            {dataset.judul}
          </h1>
          <nav className="flex items-center gap-1.5 text-sm text-slate-400 shrink-0 whitespace-nowrap">
            <Link href="/" className="flex items-center gap-1 hover:text-[#1D6FCA] transition-colors">
              <Home className="w-3.5 h-3.5" />
              Beranda
            </Link>
            <span>/</span>
            <Link href="/portal-daerah" className="hover:text-[#1D6FCA] transition-colors">
              Portal Daerah
            </Link>
            <span>/</span>
            <span className="text-slate-600 dark:text-slate-300">Detail</span>
          </nav>
        </div>

        {/* Main card */}
        <div className="bg-white dark:bg-[#0F1825] border border-slate-200 dark:border-slate-700/50 rounded-xl overflow-hidden">
          {/* Dinas header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: dataset.iconBg }}
              >
                <IconComp className="w-5 h-5" style={{ color: dataset.iconColor }} />
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm sm:text-base">
                {dataset.dinas}
              </span>
            </div>
            <span className="flex items-center gap-1.5 bg-[#E8F5F2] dark:bg-teal-900/30 text-[#0D6B56] dark:text-teal-400 text-sm font-semibold px-3 py-1.5 rounded-lg">
              <Eye className="w-4 h-4" />
              {(dataset.dilihat + 1).toLocaleString("id-ID")}
            </span>
          </div>

          {/* Bidang + date row */}
          <div className="flex items-center justify-between px-6 py-3 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-700/50">
            <span className="flex items-center gap-1.5 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs font-medium px-3 py-1.5 rounded">
              <Layers className="w-3.5 h-3.5" />
              {dataset.bidang}
            </span>
            {dataset.tanggalUpdate && (
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                {dataset.tanggalUpdate}
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-700/50 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                  activeTab === tab.key
                    ? "border-[#0D6B56] text-[#0D6B56] dark:text-teal-400 dark:border-teal-400"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === "tabel" && <TableView />}

            {activeTab === "grafik" && (
              <div>
                <h2 className="flex items-center gap-2 font-bold text-slate-700 dark:text-white text-base mb-6">
                  <BarChart2 className="w-4 h-4 text-[#0D6B56]" />
                  Grafik Dataset
                </h2>
                {chartCols.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-12">
                    Data tidak dapat divisualisasikan sebagai grafik.
                  </p>
                ) : (
                  <div style={{ height: 380 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          angle={-35}
                          textAnchor="end"
                          interval={0}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          tickFormatter={(v: number) =>
                            v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}Jt`
                              : v >= 1000 ? `${(v / 1000).toFixed(1)}K`
                              : String(v)
                          }
                        />
                        <Tooltip
                          formatter={(value) => [
                            typeof value === "number" ? value.toLocaleString("id-ID") : String(value ?? ""),
                          ]}
                        />
                        {chartCols.length > 1 && <Legend />}
                        {chartCols.map((col, idx) => (
                          <Bar
                            key={col}
                            dataKey={col}
                            name={col}
                            fill={CHART_COLORS[idx % CHART_COLORS.length]}
                            radius={[3, 3, 0, 0]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {activeTab === "metadata" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-bold text-slate-700 dark:text-white text-base mb-3">Deskripsi Dataset</h2>
                  <p className="text-sm text-[#0D6B56] dark:text-teal-400 bg-[#E8F5F2] dark:bg-teal-900/20 rounded-lg px-4 py-3 leading-relaxed">
                    {dataset.deskripsi || `Dataset ini berisi informasi tentang ${dataset.judul}.`}
                  </p>
                </div>
                <hr className="border-slate-200 dark:border-slate-700" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Instansi/OPD", value: dataset.dinas, icon: <Building2 className="w-4 h-4 text-slate-400 shrink-0" /> },
                    { label: "Bidang", value: dataset.bidang, icon: <Layers className="w-4 h-4 text-slate-400 shrink-0" /> },
                    { label: "Topik", value: dataset.topik },
                    {
                      label: "Tahun Data",
                      value: dataset.tahunMulai === dataset.tahunAkhir
                        ? String(dataset.tahunMulai)
                        : `${dataset.tahunMulai} – ${dataset.tahunAkhir}`,
                    },
                    { label: "Terakhir Diperbarui", value: dataset.tanggalUpdate || "-" },
                    { label: "Jumlah Kolom", value: `${cols.length} kolom` },
                    { label: "Jumlah Baris", value: `${dataset.rows.length} baris` },
                  ].map(({ label, value, icon }) => (
                    <div key={label}>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                        {icon}
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
                <hr className="border-slate-200 dark:border-slate-700" />
                <TableView />
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Link href="/portal-daerah" className="text-sm text-[#1D6FCA] hover:underline">
            ← Kembali ke Portal Daerah
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
