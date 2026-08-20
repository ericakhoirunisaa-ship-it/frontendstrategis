"use client";
import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import {
  BarChart2, LineChart as LineIcon, TrendingUp,
  Filter, Download, FileSpreadsheet,
} from "lucide-react";

// ── Data ─────────────────────────────────────────────────────────────────────

const TAHUN = [2021, 2022, 2023, 2024, 2025];
const TAHUN_LABELS: Record<number, string> = {
  2021: "2021", 2022: "2022", 2023: "2023", 2024: "2024*", 2025: "2025**",
};

const SEKTOR_LU = [
  { kode: "A",    nama: "Pertanian, Kehutanan, dan Perikanan",                           short: "Pertanian" },
  { kode: "B",    nama: "Pertambangan dan Penggalian",                                   short: "Pertambangan" },
  { kode: "C",    nama: "Industri Pengolahan",                                           short: "Industri Pengolahan" },
  { kode: "D",    nama: "Pengadaan Listrik dan Gas",                                     short: "Listrik & Gas" },
  { kode: "E",    nama: "Pengadaan Air; Pengelolaan Sampah, Limbah, dan Daur Ulang",     short: "Pengadaan Air" },
  { kode: "F",    nama: "Konstruksi",                                                    short: "Konstruksi" },
  { kode: "G",    nama: "Perdagangan Besar dan Eceran; Reparasi Mobil dan Sepeda Motor", short: "Perdagangan" },
  { kode: "H",    nama: "Transportasi dan Pergudangan",                                  short: "Transportasi" },
  { kode: "I",    nama: "Penyediaan Akomodasi dan Makan Minum",                         short: "Akomodasi & Makan" },
  { kode: "J",    nama: "Informasi dan Komunikasi",                                      short: "Informasi & Komunikasi" },
  { kode: "K",    nama: "Jasa Keuangan dan Asuransi",                                   short: "Jasa Keuangan" },
  { kode: "L",    nama: "Real Estat",                                                    short: "Real Estat" },
  { kode: "MN",   nama: "Jasa Perusahaan",                                               short: "Jasa Perusahaan" },
  { kode: "O",    nama: "Administrasi Pemerintahan, Pertahanan & Jaminan Sosial",        short: "Adm. Pemerintahan" },
  { kode: "P",    nama: "Jasa Pendidikan",                                               short: "Jasa Pendidikan" },
  { kode: "Q",    nama: "Jasa Kesehatan dan Kegiatan Sosial",                           short: "Jasa Kesehatan" },
  { kode: "RSTU", nama: "Jasa Lainnya",                                                  short: "Jasa Lainnya" },
];

const PENGELUARAN = [
  { kode: "RT",    nama: "Pengeluaran Konsumsi Rumah Tangga", short: "Konsumsi RT" },
  { kode: "LNPRT", nama: "Pengeluaran Konsumsi LNPRT",        short: "Konsumsi LNPRT" },
  { kode: "GOV",   nama: "Pengeluaran Konsumsi Pemerintah",   short: "Konsumsi Pemerintah" },
  { kode: "PMTB",  nama: "Pembentukan Modal Tetap Bruto",      short: "PMTB" },
  { kode: "INV",   nama: "Perubahan Inventori",                short: "Perubahan Inventori" },
  { kode: "EXPO",  nama: "Net Ekspor Barang dan Jasa",         short: "Net Ekspor" },
];

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

const LAJU_LU: Record<string, number[]> = {
  A:    [2.90,  1.86,  2.13,  1.61,  5.13],
  B:    [4.46,  5.39,  5.13,  4.21, -1.09],
  C:    [1.08,  2.67,  1.20,  1.77,  2.20],
  D:    [3.27,  7.25,  4.83,  6.94,  1.69],
  E:    [3.08,  3.07,  2.24,  3.81,  6.55],
  F:    [5.74,  6.73,  3.85,  4.47, -0.72],
  G:    [8.76,  9.39,  5.78,  6.77,  4.11],
  H:    [5.78, 10.02,  5.14,  3.39,  4.08],
  I:    [7.95,  8.74,  7.80,  8.28,  4.32],
  J:    [8.09,  6.98,  6.78,  3.85,  4.19],
  K:    [9.99, -1.54,  0.58, 10.93,  6.08],
  L:    [1.35,  6.08,  5.56,  4.13,  4.43],
  MN:   [3.57,  4.88,  5.73,  3.18,  4.19],
  O:    [3.93, -0.69,  3.94,  3.52,  2.64],
  P:    [0.94,  2.65,  4.02,  0.67,  3.46],
  Q:    [4.75,  3.73,  4.84,  4.08,  4.05],
  RSTU: [3.61,  5.15,  5.52,  4.37,  5.20],
  PDRB: [4.36,  3.64,  3.53,  3.32,  3.79],
};

const ADHB_EXP: Record<string, number[]> = {
  RT:    [4872.8,  5290.3,  5803.6,   6218.36,  6749.40],
  LNPRT: [106.2,   118.1,   131.8,    148.47,   161.23],
  GOV:   [1433.7,  1442.1,  1528.6,   1675.43,  1616.85],
  PMTB:  [2932.3,  3294.1,  3493.4,   3691.95,  3784.70],
  INV:   [160.9,   179.9,   136.5,    154.34,   199.10],
  EXPO:  [-604.7, -627.3,  -724.99,  -813.61,  -610.76],
  PDRB:  [8901.2,  9697.2, 10368.9, 11074.94, 11900.53],
};

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

export type PdrbDatasetId = "adhb_lu" | "adhk_lu" | "laju" | "adhb_exp" | "adhk_exp";

interface PdrbDataset {
  id: PdrbDatasetId;
  label: string;
  deskripsi: string;
  satuan: string;
  color: string;
  type: "lu" | "exp";
  data: Record<string, number[]>;
}

const DATASETS: PdrbDataset[] = [
  { id: "adhb_lu",  label: "PDRB ADHB",       deskripsi: "Atas Dasar Harga Berlaku Menurut Lapangan Usaha (Miliar Rp)",             satuan: "Miliar Rp", color: "#059669", type: "lu",  data: ADHB_LU },
  { id: "adhk_lu",  label: "PDRB ADHK",        deskripsi: "Atas Dasar Harga Konstan 2010 Menurut Lapangan Usaha (Miliar Rp)",        satuan: "Miliar Rp", color: "#2196F3", type: "lu",  data: ADHK_LU },
  { id: "laju",     label: "Laju Pertumbuhan",  deskripsi: "Laju Pertumbuhan PDRB Atas Dasar Harga Konstan 2010 (%)",                satuan: "%",         color: "#FF9800", type: "lu",  data: LAJU_LU },
  { id: "adhb_exp", label: "Pengeluaran ADHB",  deskripsi: "PDRB Atas Dasar Harga Berlaku Menurut Pengeluaran (Miliar Rp)",          satuan: "Miliar Rp", color: "#7C3AED", type: "exp", data: ADHB_EXP },
  { id: "adhk_exp", label: "Pengeluaran ADHK",  deskripsi: "PDRB Atas Dasar Harga Konstan 2010 Menurut Pengeluaran (Miliar Rp)",     satuan: "Miliar Rp", color: "#DC2626", type: "exp", data: ADHK_EXP },
];

const SEKTOR_COLORS = [
  "#2196F3","#4CAF50","#FF9800","#9C27B0","#F44336","#00BCD4",
  "#8BC34A","#FF5722","#607D8B","#795548","#E91E63","#3F51B5",
  "#009688","#CDDC39","#FFC107","#FF7043","#673AB7",
];

const CHART_TYPES = [
  { value: "bar",  icon: BarChart2, label: "Bar" },
  { value: "line", icon: LineIcon,  label: "Line" },
  { value: "area", icon: TrendingUp, label: "Area" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadCSV(
  ds: PdrbDataset, mode: "tahun" | "sektor",
  tidx: number, sektor: string,
  sektors: { kode: string; nama: string }[],
) {
  let csv = "";
  if (mode === "tahun") {
    csv = `Lapangan Usaha/Komponen,Nilai (${ds.satuan})\n`;
    sektors.forEach(s => { csv += `"${s.nama}",${ds.data[s.kode]?.[tidx] ?? ""}\n`; });
    csv += `"PDRB Total",${ds.data["PDRB"]?.[tidx] ?? ""}\n`;
  } else {
    csv = `Tahun,Nilai (${ds.satuan})\n`;
    TAHUN.forEach((_, i) => { csv += `${TAHUN_LABELS[TAHUN[i]]},${ds.data[sektor]?.[i] ?? ""}\n`; });
  }
  triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8" }), `${ds.label}.csv`);
}

async function downloadExcel(
  ds: PdrbDataset, mode: "tahun" | "sektor",
  tidx: number, sektor: string,
  sektors: { kode: string; nama: string }[],
) {
  const XLSX = await import("xlsx");
  let rows: (string | number)[][];
  if (mode === "tahun") {
    rows = [["Lapangan Usaha/Komponen", `Nilai (${ds.satuan})`]];
    sektors.forEach(s => rows.push([s.nama, ds.data[s.kode]?.[tidx] ?? ""]));
    rows.push(["PDRB Total", ds.data["PDRB"]?.[tidx] ?? ""]);
  } else {
    rows = [["Tahun", `Nilai (${ds.satuan})`]];
    TAHUN.forEach((_, i) => rows.push([TAHUN_LABELS[TAHUN[i]], ds.data[sektor]?.[i] ?? ""]));
  }
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, `${ds.label}.xlsx`);
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────

function PdrbTooltip({ active, payload, label, satuan, namaMap }: any) {
  if (!active || !payload?.length) return null;
  const v: number = payload[0]?.value;
  return (
    <div className="bg-[#0C2340] text-white text-xs rounded-xl px-3.5 py-3 shadow-2xl max-w-[220px] border border-white/10">
      <p className="text-[#60A5FA] text-[10px] font-bold uppercase tracking-wider mb-1 leading-tight">
        {namaMap?.[label] || label}
      </p>
      <p className="font-bold text-white">
        {typeof v === "number" ? v.toLocaleString("id-ID", { maximumFractionDigits: 2 }) : v} {satuan}
      </p>
    </div>
  );
}

// ── Panel Component ───────────────────────────────────────────────────────────

export default function EkonomiPDRBPanel({ datasetId }: { datasetId: PdrbDatasetId }) {
  const [filterMode, setFilterMode]       = useState<"tahun" | "sektor">("tahun");
  const [selectedTahun, setSelectedTahun] = useState<number>(2025);
  const [selectedSektor, setSelectedSektor] = useState<string>("A");
  const [chartType, setChartType]         = useState<"bar" | "line" | "area">("bar");

  // Reset filters whenever the selected dataset changes from sidebar
  useEffect(() => {
    const next = DATASETS.find(d => d.id === datasetId)!;
    setFilterMode("tahun");
    setSelectedTahun(2025);
    setSelectedSektor(next.type === "lu" ? "A" : "RT");
    setChartType("bar");
  }, [datasetId]);

  const ds = DATASETS.find(d => d.id === datasetId)!;
  const sektors = ds.type === "lu" ? SEKTOR_LU : PENGELUARAN;
  const sektorLabel = ds.type === "lu" ? "Per Lapangan Usaha" : "Per Komponen";

  const tidx = TAHUN.indexOf(selectedTahun);
  const validSektor = sektors.some(s => s.kode === selectedSektor)
    ? selectedSektor
    : sektors[0].kode;

  // Chart data — Per Tahun
  const chartDataTahun = [...sektors]
    .map((s, i) => ({
      short: s.short,
      nama:  s.nama,
      nilai: ds.data[s.kode]?.[tidx] ?? 0,
      color: SEKTOR_COLORS[i % SEKTOR_COLORS.length],
    }))
    .sort((a, b) => Math.abs(b.nilai) - Math.abs(a.nilai));

  // Chart data — Per Sektor
  const chartDataSektor = TAHUN.map((_, i) => ({
    tahun: TAHUN_LABELS[TAHUN[i]],
    nilai: ds.data[validSektor]?.[i] ?? 0,
  }));

  const pdrbTotal   = ds.data["PDRB"]?.[tidx];
  const isLaju      = ds.id === "laju";
  const namaMapTahun = Object.fromEntries(chartDataTahun.map(d => [d.short, d.nama]));
  const selectedSektorNama = sektors.find(s => s.kode === validSektor)?.nama || validSektor;

  // Table rows
  const tableRows = filterMode === "tahun"
    ? [
        ...sektors.map((s, i) => ({
          label: s.nama, isTotal: false,
          nilai: ds.data[s.kode]?.[tidx] ?? 0,
          color: SEKTOR_COLORS[i % SEKTOR_COLORS.length],
        })),
        { label: "PDRB Total", isTotal: true, nilai: ds.data["PDRB"]?.[tidx] ?? 0, color: "" },
      ]
    : TAHUN.map((_, i) => ({
        label: TAHUN_LABELS[TAHUN[i]], isTotal: false,
        nilai: ds.data[validSektor]?.[i] ?? 0,
        color: ds.color,
      }));

  return (
    <div className="space-y-5">
      {/* ── Chart Card ── */}
      <div className="bg-white dark:bg-[#0F1825] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700/50">

        {/* Badge + title */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white mb-1.5 bg-emerald-600">
              B. Ekonomi
            </span>
            <h2 className="text-xl font-bold text-[#1A1A2E] dark:text-white">
              Produk Domestik Regional Bruto (PDRB)
            </h2>
            <p className="text-gray-400 dark:text-slate-500 text-sm mt-0.5">
              {ds.deskripsi}
            </p>
          </div>

          {/* Chart type toggle (per sektor mode only) */}
          {filterMode === "sektor" && (
            <div className="flex gap-1 bg-gray-100 dark:bg-[#162133] p-1 rounded-lg">
              {CHART_TYPES.map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setChartType(value as any)}
                  title={label}
                  className={`p-2 rounded-md transition-colors ${
                    chartType === value
                      ? "bg-white dark:bg-[#0F1825] shadow text-[#2196F3]"
                      : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <Filter className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0" />

          {/* Per Tahun / Per Sektor toggle — same style as existing period buttons */}
          <div className="flex gap-1 bg-gray-100 dark:bg-[#162133] p-1 rounded-lg">
            <span className="w-px bg-gray-200 dark:bg-slate-600 mx-0.5 self-stretch" />
            <button
              onClick={() => setFilterMode("tahun")}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                filterMode === "tahun"
                  ? "bg-white dark:bg-[#0F1825] shadow text-[#2196F3]"
                  : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
              }`}
            >
              Per Tahun
            </button>
            <button
              onClick={() => setFilterMode("sektor")}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                filterMode === "sektor"
                  ? "bg-white dark:bg-[#0F1825] shadow text-[#2196F3]"
                  : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
              }`}
            >
              {sektorLabel}
            </button>
          </div>

          {/* Conditional dropdown */}
          {filterMode === "tahun" ? (
            <select
              value={selectedTahun}
              onChange={e => setSelectedTahun(Number(e.target.value))}
              className="text-sm border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-[#162133] text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {TAHUN.map(t => <option key={t} value={t}>{TAHUN_LABELS[t]}</option>)}
            </select>
          ) : (
            <select
              value={validSektor}
              onChange={e => setSelectedSektor(e.target.value)}
              className="text-sm border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-[#162133] text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200 max-w-xs"
            >
              {sektors.map(s => <option key={s.kode} value={s.kode}>{s.nama}</option>)}
            </select>
          )}

          {/* PDRB total chip */}
          {filterMode === "tahun" && pdrbTotal != null && (
            <span
              className="ml-auto text-xs px-3 py-1.5 rounded-lg font-semibold"
              style={{ backgroundColor: ds.color + "18", color: ds.color }}
            >
              PDRB Total: {pdrbTotal.toLocaleString("id-ID", { maximumFractionDigits: 2 })} {ds.satuan}
            </span>
          )}
        </div>

        {/* ── Chart ── */}
        {filterMode === "tahun" ? (
          <ResponsiveContainer width="100%" height={sektors.length * 46 + 30}>
            <BarChart
              data={chartDataTahun}
              layout="vertical"
              margin={{ left: 0, right: 64, top: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false} axisLine={false}
                tickFormatter={v => v.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
              />
              <YAxis
                type="category" dataKey="short"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false} axisLine={false}
                width={158}
              />
              <Tooltip
                content={<PdrbTooltip satuan={ds.satuan} namaMap={namaMapTahun} />}
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
              />
              {isLaju && <ReferenceLine x={0} stroke="#d1d5db" strokeWidth={1.5} />}
              <Bar dataKey="nilai" radius={[0, 6, 6, 0]} maxBarSize={30}
                label={{
                  position: "right",
                  formatter: (v: any) => typeof v === "number"
                    ? v.toLocaleString("id-ID", { maximumFractionDigits: 2 }) : String(v ?? ""),
                  fontSize: 10, fill: "#6b7280",
                }}
              >
                {chartDataTahun.map((entry, i) => (
                  <Cell key={`c-${i}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : chartType === "bar" ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartDataSektor} margin={{ left: 10, right: 20, top: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="tahun" tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false}
                tickFormatter={v => v.toLocaleString("id-ID", { maximumFractionDigits: 0 })} />
              <Tooltip content={<PdrbTooltip satuan={ds.satuan} />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
              {isLaju && <ReferenceLine y={0} stroke="#d1d5db" strokeWidth={1.5} />}
              <Bar dataKey="nilai" fill={ds.color} radius={[6, 6, 0, 0]} maxBarSize={64}
                label={{
                  position: "top",
                  formatter: (v: any) => typeof v === "number"
                    ? v.toLocaleString("id-ID", { maximumFractionDigits: 2 }) : String(v ?? ""),
                  fontSize: 10, fill: "#6b7280",
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : chartType === "line" ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartDataSektor} margin={{ left: 10, right: 20, top: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="tahun" tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false}
                tickFormatter={v => v.toLocaleString("id-ID", { maximumFractionDigits: 0 })} />
              <Tooltip content={<PdrbTooltip satuan={ds.satuan} />}
                cursor={{ stroke: ds.color, strokeWidth: 1, strokeDasharray: "4 2" }} />
              {isLaju && <ReferenceLine y={0} stroke="#d1d5db" strokeWidth={1.5} />}
              <Line type="monotone" dataKey="nilai" stroke={ds.color} strokeWidth={2.5}
                dot={{ r: 5, fill: ds.color, strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 7, fill: ds.color, stroke: "#fff", strokeWidth: 2 }}
                label={{
                  position: "top",
                  formatter: (v: any) => typeof v === "number"
                    ? v.toLocaleString("id-ID", { maximumFractionDigits: 2 }) : String(v ?? ""),
                  fontSize: 10, fill: "#6b7280",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartDataSektor} margin={{ left: 10, right: 20, top: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="pdrbGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={ds.color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={ds.color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="tahun" tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false}
                tickFormatter={v => v.toLocaleString("id-ID", { maximumFractionDigits: 0 })} />
              <Tooltip content={<PdrbTooltip satuan={ds.satuan} />}
                cursor={{ stroke: ds.color, strokeWidth: 1, strokeDasharray: "4 2" }} />
              {isLaju && <ReferenceLine y={0} stroke="#d1d5db" strokeWidth={1.5} />}
              <Area type="monotone" dataKey="nilai" stroke={ds.color} strokeWidth={2.5}
                fill="url(#pdrbGrad)"
                dot={{ r: 5, fill: ds.color, strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 7, fill: ds.color, stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

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
                ? `${TAHUN_LABELS[selectedTahun]} — Seluruh ${ds.type === "lu" ? "Lapangan Usaha" : "Komponen"}`
                : `${selectedSektorNama} — 2021 s.d. 2025`}
            </span>
          </h3>
          <div className="flex gap-1.5">
            <button
              onClick={() => downloadCSV(ds, filterMode, tidx, validSektor, sektors)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700/50 text-xs text-gray-500 dark:text-slate-400 hover:text-green-600 hover:border-green-400 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              onClick={() => downloadExcel(ds, filterMode, tidx, validSektor, sektors)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700/50 text-xs text-gray-500 dark:text-slate-400 hover:text-green-600 hover:border-green-400 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 dark:text-slate-500 mb-3">
          Filter tabel mengikuti filter grafik di atas.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-100 dark:border-slate-700/50">
                <th className="text-left py-2.5 px-3 text-gray-500 dark:text-slate-400 font-semibold whitespace-nowrap">
                  {filterMode === "tahun"
                    ? (ds.type === "lu" ? "Lapangan Usaha" : "Komponen Pengeluaran")
                    : "Tahun"}
                </th>
                <th className="text-right py-2.5 px-3 text-gray-500 dark:text-slate-400 font-semibold whitespace-nowrap">
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
                      ? "bg-gray-50 dark:bg-slate-800/30"
                      : "hover:bg-blue-50/40 dark:hover:bg-blue-900/20"
                  }`}
                >
                  <td className={`py-2.5 px-3 ${row.isTotal ? "font-semibold text-gray-700 dark:text-slate-200" : "text-gray-600 dark:text-slate-300"}`}>
                    {!row.isTotal && filterMode === "tahun" && (
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-2 shrink-0 align-middle"
                        style={{ backgroundColor: row.color }}
                      />
                    )}
                    {row.label}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <span className={`font-semibold ${
                      isLaju && row.nilai < 0 ? "text-red-500"
                      : isLaju && row.nilai > 0 ? "text-emerald-600 dark:text-emerald-400"
                      : "text-[#1A1A2E] dark:text-white"
                    } ${row.isTotal ? "text-base" : ""}`}>
                      {row.nilai != null
                        ? row.nilai.toLocaleString("id-ID", { maximumFractionDigits: 2 })
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
  );
}
