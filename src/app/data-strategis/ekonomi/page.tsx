"use client";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import {
  Filter, BarChart2, TrendingUp, Download, FileSpreadsheet, ChevronLeft,
} from "lucide-react";
import Link from "next/link";

// ── Static Data ───────────────────────────────────────────────────────────────

const TAHUN = [2021, 2022, 2023, 2024, 2025];
const TAHUN_LABELS: Record<number, string> = {
  2021: "2021", 2022: "2022", 2023: "2023", 2024: "2024*", 2025: "2025**",
};

const SEKTOR_LU = [
  { kode: "A",    nama: "Pertanian, Kehutanan, dan Perikanan",                              short: "Pertanian" },
  { kode: "B",    nama: "Pertambangan dan Penggalian",                                      short: "Pertambangan" },
  { kode: "C",    nama: "Industri Pengolahan",                                              short: "Industri Pengolahan" },
  { kode: "D",    nama: "Pengadaan Listrik dan Gas",                                        short: "Listrik & Gas" },
  { kode: "E",    nama: "Pengadaan Air; Pengelolaan Sampah, Limbah, dan Daur Ulang",        short: "Pengadaan Air" },
  { kode: "F",    nama: "Konstruksi",                                                        short: "Konstruksi" },
  { kode: "G",    nama: "Perdagangan Besar dan Eceran; Reparasi Mobil dan Sepeda Motor",    short: "Perdagangan" },
  { kode: "H",    nama: "Transportasi dan Pergudangan",                                      short: "Transportasi" },
  { kode: "I",    nama: "Penyediaan Akomodasi dan Makan Minum",                             short: "Akomodasi & Makan" },
  { kode: "J",    nama: "Informasi dan Komunikasi",                                          short: "Informasi & Komunikasi" },
  { kode: "K",    nama: "Jasa Keuangan dan Asuransi",                                       short: "Jasa Keuangan" },
  { kode: "L",    nama: "Real Estat",                                                        short: "Real Estat" },
  { kode: "MN",   nama: "Jasa Perusahaan",                                                   short: "Jasa Perusahaan" },
  { kode: "O",    nama: "Administrasi Pemerintahan, Pertahanan & Jaminan Sosial",            short: "Adm. Pemerintahan" },
  { kode: "P",    nama: "Jasa Pendidikan",                                                   short: "Jasa Pendidikan" },
  { kode: "Q",    nama: "Jasa Kesehatan dan Kegiatan Sosial",                               short: "Jasa Kesehatan" },
  { kode: "RSTU", nama: "Jasa Lainnya",                                                      short: "Jasa Lainnya" },
];

const PENGELUARAN = [
  { kode: "RT",    nama: "Pengeluaran Konsumsi Rumah Tangga",  short: "Konsumsi RT" },
  { kode: "LNPRT", nama: "Pengeluaran Konsumsi LNPRT",         short: "Konsumsi LNPRT" },
  { kode: "GOV",   nama: "Pengeluaran Konsumsi Pemerintah",    short: "Konsumsi Pemerintah" },
  { kode: "PMTB",  nama: "Pembentukan Modal Tetap Bruto",       short: "PMTB" },
  { kode: "INV",   nama: "Perubahan Inventori",                 short: "Perubahan Inventori" },
  { kode: "EXPO",  nama: "Net Ekspor Barang dan Jasa",          short: "Net Ekspor" },
];

// PDRB ADHB Lapangan Usaha (Miliar Rp)
const ADHB_LU: Record<string, number[]> = {
  A:    [3520.94, 3812.54, 4060.59, 4353.56, 4876.85],
  B:    [156.61,  175.17,  191.89,  207.38,  210.30],
  C:    [206.70,  216.18,  220.65,  230.23,  246.39],
  D:    [2.28,    2.49,    2.64,    2.83,    2.95],
  E:    [22.58,   24.05,   25.10,   26.40,   28.51],
  F:    [1062.10, 1195.36, 1283.81, 1388.11, 1412.10],
  G:    [862.35,  983.31,  1074.36, 1168.53, 1241.70],
  H:    [336.60,  400.09,  435.24,  454.37,  475.39],
  I:    [52.69,   58.28,   63.65,   69.88,   75.12],
  J:    [472.61,  508.58,  542.39,  567.52,  591.00],
  K:    [326.32,  351.18,  357.13,  397.09,  425.67],
  L:    [210.36,  227.10,  254.28,  277.51,  292.16],
  MN:   [16.89,   18.19,   19.86,   21.11,   22.80],
  O:    [943.90,  971.89,  1031.93, 1083.04, 1126.33],
  P:    [423.24,  448.08,  475.21,  478.76,  504.94],
  Q:    [147.45,  156.69,  170.03,  178.45,  187.64],
  RSTU: [137.57,  148.09,  160.17,  170.17,  180.67],
  PDRB: [8901.21, 9697.26, 10368.93, 11074.94, 11900.53],
};

// PDRB ADHK Lapangan Usaha (Miliar Rp, harga konstan 2010)
const ADHK_LU: Record<string, number[]> = {
  A:    [2431.67, 2476.89, 2529.24, 2570.54, 2702.40],
  B:    [99.59,   104.97,  110.35,  115.00,  113.74],
  C:    [138.79,  142.50,  144.21,  146.76,  150.00],
  D:    [2.15,    2.31,    2.42,    2.59,    2.63],
  E:    [13.87,   14.30,   14.62,   15.18,   16.17],
  F:    [609.84,  650.89,  675.94,  706.17,  701.08],
  G:    [495.58,  542.11,  573.46,  612.26,  637.44],
  H:    [217.51,  239.30,  251.60,  260.13,  270.74],
  I:    [32.81,   35.68,   38.46,   41.64,   43.44],
  J:    [371.87,  397.81,  424.78,  441.13,  459.60],
  K:    [212.08,  208.81,  210.01,  232.96,  247.13],
  L:    [148.75,  157.79,  166.57,  173.45,  181.14],
  MN:   [10.16,   10.66,   11.27,   11.63,   12.12],
  O:    [546.31,  542.54,  563.91,  583.75,  599.15],
  P:    [277.27,  284.62,  296.06,  298.05,  308.37],
  Q:    [87.02,   90.26,   94.63,   98.49,   102.48],
  RSTU: [80.96,   85.13,   89.83,   93.76,   98.64],
  PDRB: [5776.24, 5986.58, 6197.36, 6403.50, 6646.27],
};

// Laju Pertumbuhan PDRB ADHK (%)
const LAJU_LU: Record<string, number[]> = {
  A:    [2.90,  1.86,  2.13, 1.61,  5.13],
  B:    [4.46,  5.39,  5.13, 4.21, -1.09],
  C:    [1.08,  2.67,  1.20, 1.77,  2.20],
  D:    [3.27,  7.25,  4.83, 6.94,  1.69],
  E:    [3.08,  3.07,  2.24, 3.81,  6.55],
  F:    [5.74,  6.73,  3.85, 4.47, -0.72],
  G:    [8.76,  9.39,  5.78, 6.77,  4.11],
  H:    [5.78, 10.02,  5.14, 3.39,  4.08],
  I:    [7.95,  8.74,  7.80, 8.28,  4.32],
  J:    [8.09,  6.98,  6.78, 3.85,  4.19],
  K:    [9.99, -1.54,  0.58, 10.93, 6.08],
  L:    [1.35,  6.08,  5.56, 4.13,  4.43],
  MN:   [3.57,  4.88,  5.73, 3.18,  4.19],
  O:    [3.93, -0.69,  3.94, 3.52,  2.64],
  P:    [0.94,  2.65,  4.02, 0.67,  3.46],
  Q:    [4.75,  3.73,  4.84, 4.08,  4.05],
  RSTU: [3.61,  5.15,  5.52, 4.37,  5.20],
  PDRB: [4.36,  3.64,  3.53, 3.32,  3.79],
};

// PDRB Pengeluaran ADHB (Miliar Rp)
const ADHB_EXP: Record<string, number[]> = {
  RT:    [4872.8,  5290.3,  5803.6,   6218.36,  6749.40],
  LNPRT: [106.2,   118.1,   131.8,    148.47,   161.23],
  GOV:   [1433.7,  1442.1,  1528.6,   1675.43,  1616.85],
  PMTB:  [2932.3,  3294.1,  3493.4,   3691.95,  3784.70],
  INV:   [160.9,   179.9,   136.5,    154.34,   199.10],
  EXPO:  [-604.7, -627.3,  -724.99,  -813.61,  -610.76],
  PDRB:  [8901.2,  9697.2, 10368.9, 11074.94, 11900.53],
};

// PDRB Pengeluaran ADHK (Miliar Rp, harga konstan 2010)
const ADHK_EXP: Record<string, number[]> = {
  RT:    [2908.8,  3022.5,  3189.6,  3339.85,  3520.18],
  LNPRT: [63.3,    67.1,    71.1,    78.61,    83.87],
  GOV:   [802.8,   788.1,   810.3,   882.42,   841.99],
  PMTB:  [2054.9,  2178.6,  2209.7,  2260.27,  2264.99],
  INV:   [103.2,   107.8,    75.4,    79.18,    99.36],
  EXPO:  [-156.8, -177.6,  -158.7,  -236.82,  -164.13],
  PDRB:  [5776.2,  5986.5,  6197.4,  6403.50,  6646.27],
};

// ── Dataset Config ────────────────────────────────────────────────────────────

type DatasetId = "adhb_lu" | "adhk_lu" | "laju" | "adhb_exp" | "adhk_exp";
type FilterMode = "tahun" | "sektor";

interface Dataset {
  id: DatasetId;
  label: string;
  sublabel: string;
  satuan: string;
  color: string;
  type: "lu" | "exp";
  data: Record<string, number[]>;
}

const DATASETS: Dataset[] = [
  { id: "adhb_lu",  label: "PDRB ADHB",        sublabel: "Lapangan Usaha",  satuan: "Miliar Rp", color: "#059669", type: "lu",  data: ADHB_LU },
  { id: "adhk_lu",  label: "PDRB ADHK",         sublabel: "Lapangan Usaha",  satuan: "Miliar Rp", color: "#2196F3", type: "lu",  data: ADHK_LU },
  { id: "laju",     label: "Laju Pertumbuhan",   sublabel: "PDRB ADHK",       satuan: "%",         color: "#FF9800", type: "lu",  data: LAJU_LU },
  { id: "adhb_exp", label: "PDRB ADHB",          sublabel: "Pengeluaran",      satuan: "Miliar Rp", color: "#7C3AED", type: "exp", data: ADHB_EXP },
  { id: "adhk_exp", label: "PDRB ADHK",          sublabel: "Pengeluaran",      satuan: "Miliar Rp", color: "#DC2626", type: "exp", data: ADHK_EXP },
];

const SEKTOR_COLORS = [
  "#2196F3","#4CAF50","#FF9800","#9C27B0","#F44336","#00BCD4",
  "#8BC34A","#FF5722","#607D8B","#795548","#E91E63","#3F51B5",
  "#009688","#CDDC39","#FFC107","#FF7043","#673AB7",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtNum(v: number, satuan: string) {
  return `${v.toLocaleString("id-ID", { maximumFractionDigits: 2 })} ${satuan}`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadCSV(
  ds: Dataset,
  filterMode: FilterMode,
  selectedTahun: number,
  selectedSektor: string,
  sektors: { kode: string; nama: string; short: string }[],
) {
  let csv = "";
  if (filterMode === "tahun") {
    csv = `Lapangan Usaha,Nilai (${ds.satuan})\n`;
    const tahunIdx = TAHUN.indexOf(selectedTahun);
    sektors.forEach(s => {
      const v = ds.data[s.kode]?.[tahunIdx] ?? "";
      csv += `"${s.nama}",${v}\n`;
    });
    const total = ds.data["PDRB"]?.[tahunIdx] ?? "";
    csv += `"PDRB Total",${total}\n`;
  } else {
    csv = `Tahun,Nilai (${ds.satuan})\n`;
    TAHUN.forEach((t, i) => {
      const v = ds.data[selectedSektor]?.[i] ?? "";
      csv += `${TAHUN_LABELS[t]},${v}\n`;
    });
  }
  triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8" }), `${ds.label}-${ds.sublabel}.csv`);
}

async function downloadExcel(
  ds: Dataset,
  filterMode: FilterMode,
  selectedTahun: number,
  selectedSektor: string,
  sektors: { kode: string; nama: string; short: string }[],
) {
  const XLSX = await import("xlsx");
  let rows: (string | number)[][];
  if (filterMode === "tahun") {
    const tahunIdx = TAHUN.indexOf(selectedTahun);
    rows = [["Lapangan Usaha", `Nilai (${ds.satuan})`]];
    sektors.forEach(s => rows.push([s.nama, ds.data[s.kode]?.[tahunIdx] ?? ""]));
    rows.push(["PDRB Total", ds.data["PDRB"]?.[tahunIdx] ?? ""]);
  } else {
    rows = [["Tahun", `Nilai (${ds.satuan})`]];
    TAHUN.forEach((t, i) => rows.push([TAHUN_LABELS[t], ds.data[selectedSektor]?.[i] ?? ""]));
  }
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, `${ds.label}-${ds.sublabel}.xlsx`);
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label, satuan, namaMap }: any) {
  if (!active || !payload?.length) return null;
  const v: number = payload[0]?.value;
  const displayLabel = namaMap?.[label] || label;
  return (
    <div className="bg-[#0C2340] text-white text-xs rounded-xl px-3.5 py-3 shadow-2xl max-w-xs border border-white/10">
      <p className="text-[#60A5FA] text-[10px] font-bold uppercase tracking-wider mb-1.5 leading-tight">{displayLabel}</p>
      <p className="font-bold text-white">{fmtNum(v, satuan)}</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function EkonomiPDRBPage() {
  const [activeId, setActiveId] = useState<DatasetId>("adhb_lu");
  const [filterMode, setFilterMode] = useState<FilterMode>("tahun");
  const [selectedTahun, setSelectedTahun] = useState<number>(2025);
  const [selectedSektor, setSelectedSektor] = useState<string>("A");
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  const ds = DATASETS.find(d => d.id === activeId)!;
  const sektors = ds.type === "lu" ? SEKTOR_LU : PENGELUARAN;
  const sektorLabel = ds.type === "lu" ? "Per Lapangan Usaha" : "Per Komponen";

  // Validate selectedSektor when switching dataset type
  const activeSektorKode = sektors.some(s => s.kode === selectedSektor)
    ? selectedSektor
    : sektors[0].kode;

  const tahunIdx = TAHUN.indexOf(selectedTahun);

  // Chart data
  const chartDataTahun = [...sektors]
    .map((s, i) => ({
      short: s.short,
      nama: s.nama,
      kode: s.kode,
      nilai: ds.data[s.kode]?.[tahunIdx] ?? 0,
      color: SEKTOR_COLORS[i % SEKTOR_COLORS.length],
    }))
    .sort((a, b) => Math.abs(b.nilai) - Math.abs(a.nilai));

  const chartDataSektor = TAHUN.map((t, i) => ({
    tahun: TAHUN_LABELS[t],
    nilai: ds.data[activeSektorKode]?.[i] ?? 0,
  }));

  const pdrbTotal = ds.data["PDRB"]?.[tahunIdx];
  const pdrbTotalSektor = ds.type === "lu" && ds.id !== "laju"
    ? undefined
    : undefined;

  // Table rows
  const tableRows: { label: string; values: number[]; isTotal?: boolean }[] =
    filterMode === "tahun"
      ? [
          ...sektors.map(s => ({ label: s.nama, values: [ds.data[s.kode]?.[tahunIdx] ?? 0] })),
          { label: "PDRB Total", values: [ds.data["PDRB"]?.[tahunIdx] ?? 0], isTotal: true },
        ]
      : TAHUN.map((t, i) => ({
          label: TAHUN_LABELS[t],
          values: [ds.data[activeSektorKode]?.[i] ?? 0],
        }));

  const selectedSektorNama = sektors.find(s => s.kode === activeSektorKode)?.nama || activeSektorKode;

  // Short name map for tooltip
  const namaMapTahun: Record<string, string> = Object.fromEntries(
    chartDataTahun.map(d => [d.short, d.nama])
  );

  const isLaju = ds.id === "laju";

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F8FC] dark:bg-[#0B1120]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-400 dark:text-slate-500">
          <Link href="/data-strategis" className="flex items-center gap-1 hover:text-[#059669] transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" /> Data Strategis
          </Link>
          <span>/</span>
          <span className="text-gray-600 dark:text-slate-300 font-medium">Ekonomi — PDRB</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <span className="inline-block px-4 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-semibold rounded-full mb-3">
            B. Ekonomi
          </span>
          <h1 className="text-3xl font-bold text-[#1A1A2E] dark:text-white">
            Produk Domestik Regional Bruto (PDRB)
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm">
            Kabupaten Toli-Toli — Data 2021–2025. Sumber: BPS Kabupaten Toli-Toli.
          </p>
        </div>

        {/* Dataset Tab Selector */}
        <div className="mb-6 bg-white dark:bg-[#0F1825] rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-slate-700/50">
          <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest px-2 pb-2">
            Pilih Dataset
          </p>
          <div className="flex flex-wrap gap-2">
            {DATASETS.map(d => (
              <button
                key={d.id}
                onClick={() => { setActiveId(d.id); setSelectedSektor(d.type === "lu" ? "A" : "RT"); }}
                className={`flex flex-col px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                  activeId === d.id
                    ? "text-white shadow-sm border-transparent"
                    : "text-gray-500 dark:text-slate-400 border-gray-100 dark:border-slate-700/50 hover:border-gray-300 dark:hover:border-slate-500"
                }`}
                style={activeId === d.id ? { backgroundColor: d.color, borderColor: d.color } : undefined}
              >
                <span className="font-bold">{d.label}</span>
                <span className={`font-normal text-[10px] ${activeId === d.id ? "text-white/80" : "text-gray-400 dark:text-slate-500"}`}>
                  {d.sublabel}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Chart Card */}
        <div className="bg-white dark:bg-[#0F1825] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700/50 mb-5">

          {/* Chart Header */}
          <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: ds.color }}
                />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: ds.color }}>
                  {ds.label} — {ds.sublabel}
                </span>
              </div>
              <h2 className="text-lg font-bold text-[#1A1A2E] dark:text-white">
                {filterMode === "tahun"
                  ? `Seluruh ${ds.type === "lu" ? "Lapangan Usaha" : "Komponen Pengeluaran"} — Tahun ${TAHUN_LABELS[selectedTahun]}`
                  : selectedSektorNama}
              </h2>
            </div>

            {/* Chart type toggle (only for "per sektor" mode) */}
            {filterMode === "sektor" && (
              <div className="flex gap-1 bg-gray-100 dark:bg-[#162133] p-1 rounded-lg">
                <button
                  onClick={() => setChartType("bar")}
                  title="Bar Chart"
                  className={`p-2 rounded-md transition-colors ${
                    chartType === "bar"
                      ? "bg-white dark:bg-[#0F1825] shadow text-[#2196F3]"
                      : "text-gray-400 dark:text-slate-500 hover:text-gray-600"
                  }`}
                >
                  <BarChart2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setChartType("line")}
                  title="Line Chart"
                  className={`p-2 rounded-md transition-colors ${
                    chartType === "line"
                      ? "bg-white dark:bg-[#0F1825] shadow text-[#2196F3]"
                      : "text-gray-400 dark:text-slate-500 hover:text-gray-600"
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-3 mb-5 p-3 bg-gray-50 dark:bg-[#162133] rounded-xl">
            <Filter className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0" />

            {/* Mode Toggle */}
            <div className="flex bg-white dark:bg-[#0F1825] rounded-lg p-1 gap-1 shadow-sm border border-gray-100 dark:border-slate-700/50">
              <button
                onClick={() => setFilterMode("tahun")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  filterMode === "tahun"
                    ? "text-white shadow-sm"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                }`}
                style={filterMode === "tahun" ? { backgroundColor: ds.color } : undefined}
              >
                Per Tahun
              </button>
              <button
                onClick={() => setFilterMode("sektor")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  filterMode === "sektor"
                    ? "text-white shadow-sm"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                }`}
                style={filterMode === "sektor" ? { backgroundColor: ds.color } : undefined}
              >
                {sektorLabel}
              </button>
            </div>

            {/* Conditional Dropdown */}
            {filterMode === "tahun" ? (
              <select
                value={selectedTahun}
                onChange={e => setSelectedTahun(Number(e.target.value))}
                className="text-sm border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-[#0F1825] text-gray-700 dark:text-white focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": ds.color } as React.CSSProperties}
              >
                {TAHUN.map(t => (
                  <option key={t} value={t}>{TAHUN_LABELS[t]}</option>
                ))}
              </select>
            ) : (
              <select
                value={activeSektorKode}
                onChange={e => setSelectedSektor(e.target.value)}
                className="text-sm border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-[#0F1825] text-gray-700 dark:text-white focus:outline-none focus:ring-2 max-w-xs truncate"
              >
                {sektors.map(s => (
                  <option key={s.kode} value={s.kode}>{s.nama}</option>
                ))}
              </select>
            )}

            {/* PDRB Total Badge */}
            {filterMode === "tahun" && pdrbTotal != null && (
              <div
                className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-xs font-semibold"
                style={{ backgroundColor: ds.color + "20", color: ds.color }}
              >
                <span className="text-[10px] font-normal opacity-80">PDRB Total</span>
                <span className="font-bold">{fmtNum(pdrbTotal, ds.satuan)}</span>
              </div>
            )}
          </div>

          {/* ── Chart Rendering ── */}
          {filterMode === "tahun" ? (
            // Horizontal Bar Chart — seluruh sektor untuk tahun terpilih
            <ResponsiveContainer width="100%" height={sektors.length * 46 + 30}>
              <BarChart
                data={chartDataTahun}
                layout="vertical"
                margin={{ left: 0, right: 60, top: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => v.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                />
                <YAxis
                  type="category"
                  dataKey="short"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                  width={155}
                />
                <Tooltip
                  content={<CustomTooltip satuan={ds.satuan} namaMap={namaMapTahun} />}
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                />
                {isLaju && <ReferenceLine x={0} stroke="#d1d5db" strokeWidth={1.5} />}
                <Bar dataKey="nilai" radius={[0, 6, 6, 0]} maxBarSize={32}
                  label={{
                    position: "right",
                    formatter: (v: any) => typeof v === "number" ? v.toLocaleString("id-ID", { maximumFractionDigits: 2 }) : String(v ?? ""),
                    fontSize: 10,
                    fill: "#6b7280",
                  }}
                >
                  {chartDataTahun.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            // Vertical Bar / Line Chart — satu sektor seluruh tahun
            <ResponsiveContainer width="100%" height={340}>
              {chartType === "bar" ? (
                <BarChart data={chartDataSektor} margin={{ left: 10, right: 20, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="tahun" tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={v => v.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                  />
                  <Tooltip
                    content={<CustomTooltip satuan={ds.satuan} />}
                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  />
                  {isLaju && <ReferenceLine y={0} stroke="#d1d5db" strokeWidth={1.5} label={{ value: "0%", fontSize: 10, fill: "#9ca3af" }} />}
                  <Bar dataKey="nilai" fill={ds.color} radius={[6, 6, 0, 0]} maxBarSize={64}
                    label={{
                      position: "top",
                      formatter: (v: any) => typeof v === "number" ? v.toLocaleString("id-ID", { maximumFractionDigits: 2 }) : String(v ?? ""),
                      fontSize: 10,
                      fill: "#6b7280",
                    }}
                  />
                </BarChart>
              ) : (
                <LineChart data={chartDataSektor} margin={{ left: 10, right: 20, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="tahun" tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={v => v.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                  />
                  <Tooltip
                    content={<CustomTooltip satuan={ds.satuan} />}
                    cursor={{ stroke: ds.color, strokeWidth: 1, strokeDasharray: "4 2" }}
                  />
                  {isLaju && <ReferenceLine y={0} stroke="#d1d5db" strokeWidth={1.5} />}
                  <Line
                    type="monotone"
                    dataKey="nilai"
                    stroke={ds.color}
                    strokeWidth={2.5}
                    dot={{ r: 5, fill: ds.color, strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 7, fill: ds.color, stroke: "#fff", strokeWidth: 2 }}
                    label={{
                      position: "top",
                      formatter: (v: any) => typeof v === "number" ? v.toLocaleString("id-ID", { maximumFractionDigits: 2 }) : String(v ?? ""),
                      fontSize: 10,
                      fill: "#6b7280",
                    }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}

          {/* Caption */}
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-3 text-right">
            *) Angka sementara &nbsp;|&nbsp; **) Angka sangat sementara &nbsp;|&nbsp;
            Satuan: {ds.satuan} &nbsp;|&nbsp; Sumber: BPS Kabupaten Toli-Toli
          </p>
        </div>

        {/* ── Tabel Data ── */}
        <div className="bg-white dark:bg-[#0F1825] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700/50">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="font-semibold text-[#1A1A2E] dark:text-white">
              Tabel Data
              <span className="ml-2 text-xs font-normal text-gray-400 dark:text-slate-500">
                {filterMode === "tahun"
                  ? `${ds.label} ${ds.sublabel} — ${TAHUN_LABELS[selectedTahun]}`
                  : `${selectedSektorNama} — 2021 s.d. 2025`}
              </span>
            </h3>
            <div className="flex gap-1.5">
              <button
                onClick={() => downloadCSV(ds, filterMode, selectedTahun, activeSektorKode, sektors)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700/50 text-xs text-gray-500 dark:text-slate-400 hover:text-green-600 hover:border-green-400 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
              <button
                onClick={() => downloadExcel(ds, filterMode, selectedTahun, activeSektorKode, sektors)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700/50 text-xs text-gray-500 dark:text-slate-400 hover:text-green-600 hover:border-green-400 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-100 dark:border-slate-700/50">
                  <th className="text-left py-2.5 px-3 text-gray-500 dark:text-slate-400 font-semibold">
                    {filterMode === "tahun"
                      ? (ds.type === "lu" ? "Lapangan Usaha" : "Komponen Pengeluaran")
                      : "Tahun"}
                  </th>
                  <th className="text-right py-2.5 px-3 text-gray-500 dark:text-slate-400 font-semibold">
                    Nilai ({ds.satuan})
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-gray-50 dark:border-slate-700/50 transition-colors ${
                      row.isTotal
                        ? "bg-gray-50 dark:bg-slate-800/30 font-semibold"
                        : "hover:bg-blue-50/40 dark:hover:bg-blue-900/20"
                    }`}
                  >
                    <td className={`py-2.5 px-3 ${row.isTotal ? "text-gray-700 dark:text-slate-200" : "text-gray-600 dark:text-slate-300"}`}>
                      {row.label}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-[#1A1A2E] dark:text-white">
                      <span
                        className={
                          isLaju && row.values[0] < 0
                            ? "text-red-500"
                            : isLaju && row.values[0] > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : ""
                        }
                      >
                        {row.values[0] != null
                          ? row.values[0].toLocaleString("id-ID", { maximumFractionDigits: 2 })
                          : "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-3">
            *) Angka sementara &nbsp;|&nbsp; **) Angka sangat sementara &nbsp;|&nbsp;
            Sumber: BPS Kabupaten Toli-Toli
          </p>
        </div>

      </div>

      <Footer />
    </div>
  );
}
