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
import KamusStatikPanel from "./KamusStatikPanel";
import { indikatorApi } from "@/lib/api";

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

// ── Dataset Config ────────────────────────────────────────────────────────────

export type PdrbDatasetId = "adhb_lu" | "adhk_lu" | "laju" | "adhb_exp" | "adhk_exp";

interface PdrbDataset {
  id: PdrbDatasetId;
  label: string;
  deskripsi: string;
  satuan: string;
  color: string;
  type: "lu" | "exp";
  slug: string;
}

const DATASETS: PdrbDataset[] = [
  { id: "adhb_lu",  label: "PDRB ADHB",       deskripsi: "Atas Dasar Harga Berlaku Menurut Lapangan Usaha (Miliar Rp)",             satuan: "Miliar Rp", color: "#059669", type: "lu",  slug: "pdrb-adhb-lapangan-usaha"  },
  { id: "adhk_lu",  label: "PDRB ADHK",        deskripsi: "Atas Dasar Harga Konstan 2010 Menurut Lapangan Usaha (Miliar Rp)",        satuan: "Miliar Rp", color: "#2196F3", type: "lu",  slug: "pdrb-adhk-lapangan-usaha"  },
  { id: "laju",     label: "Laju Pertumbuhan",  deskripsi: "Laju Pertumbuhan PDRB Atas Dasar Harga Konstan 2010 (%)",                satuan: "%",         color: "#FF9800", type: "lu",  slug: "laju-pertumbuhan-pdrb"     },
  { id: "adhb_exp", label: "Pengeluaran ADHB",  deskripsi: "PDRB Atas Dasar Harga Berlaku Menurut Pengeluaran (Miliar Rp)",          satuan: "Miliar Rp", color: "#7C3AED", type: "exp", slug: "pdrb-adhb-pengeluaran"     },
  { id: "adhk_exp", label: "Pengeluaran ADHK",  deskripsi: "PDRB Atas Dasar Harga Konstan 2010 Menurut Pengeluaran (Miliar Rp)",     satuan: "Miliar Rp", color: "#DC2626", type: "exp", slug: "pdrb-adhk-pengeluaran"     },
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
  const [filterMode, setFilterMode]         = useState<"tahun" | "sektor">("tahun");
  const [selectedTahun, setSelectedTahun]   = useState<number>(2025);
  const [selectedSektor, setSelectedSektor] = useState<string>("A");
  const [chartType, setChartType]           = useState<"bar" | "line" | "area">("bar");
  const [apiData, setApiData]               = useState<Array<{ tahun: number; daerah: string; kolom: string; nilai: number }>>([]);
  const [loadingData, setLoadingData]       = useState(false);

  // Reset filters and fetch data whenever the selected dataset changes from sidebar
  useEffect(() => {
    const next = DATASETS.find(d => d.id === datasetId)!;
    setFilterMode("tahun");
    setSelectedTahun(2025);
    setSelectedSektor(next.type === "lu" ? "A" : "RT");
    setChartType("bar");
    // Fetch data from API
    setLoadingData(true);
    setApiData([]);
    indikatorApi.getBySlug(next.slug)
      .then(r => setApiData(r.data?.data ?? []))
      .catch(() => setApiData([]))
      .finally(() => setLoadingData(false));
  }, [datasetId]);

  const ds = DATASETS.find(d => d.id === datasetId)!;
  const sektors = ds.type === "lu" ? SEKTOR_LU : PENGELUARAN;
  const sektorLabel = ds.type === "lu" ? "Per Lapangan Usaha" : "Per Komponen";

  const validSektor = sektors.some(s => s.kode === selectedSektor)
    ? selectedSektor
    : sektors[0].kode;

  // Helper to get value from API data
  const getValue = (daerah: string, tahun: number): number | null => {
    const dp = apiData.find(d => d.daerah === daerah && d.tahun === tahun);
    return dp != null ? dp.nilai : null;
  };

  // PDRB total from API
  const pdrbTotal = getValue("PDRB", selectedTahun);

  // Chart data — Per Tahun
  const chartDataTahun = [...sektors]
    .map((s, i) => {
      const v = getValue(s.kode, selectedTahun);
      return {
        short: s.short,
        nama: s.nama,
        nilai: v ?? 0,
        hasData: v != null,
        color: SEKTOR_COLORS[i % SEKTOR_COLORS.length],
      };
    })
    .filter(d => d.hasData)
    .sort((a, b) => Math.abs(b.nilai) - Math.abs(a.nilai));

  // Chart data — Per Sektor
  const chartDataSektor = TAHUN.map((t, i) => ({
    tahun: TAHUN_LABELS[TAHUN[i]],
    nilai: getValue(validSektor, t) ?? 0,
  }));

  const isLaju = ds.id === "laju";
  const namaMapTahun = Object.fromEntries(chartDataTahun.map(d => [d.short, d.nama]));
  const selectedSektorNama = sektors.find(s => s.kode === validSektor)?.nama || validSektor;

  // Table rows
  const tableRows = filterMode === "tahun"
    ? [
        ...sektors.map((s, i) => ({
          label: s.nama, isTotal: false,
          nilai: getValue(s.kode, selectedTahun),
          color: SEKTOR_COLORS[i % SEKTOR_COLORS.length],
        })),
        { label: "PDRB Total", isTotal: true, nilai: getValue("PDRB", selectedTahun), color: "" },
      ]
    : TAHUN.map((t, i) => ({
        label: TAHUN_LABELS[TAHUN[i]], isTotal: false,
        nilai: getValue(validSektor, t),
        color: ds.color,
      }));

  // Download helpers using apiData
  const handleDownloadCSV = () => {
    let csv = "";
    if (filterMode === "tahun") {
      csv = `Lapangan Usaha/Komponen,Nilai (${ds.satuan})\n`;
      sektors.forEach(s => {
        const v = getValue(s.kode, selectedTahun);
        csv += `"${s.nama}",${v != null ? v : ""}\n`;
      });
      const total = getValue("PDRB", selectedTahun);
      csv += `"PDRB Total",${total != null ? total : ""}\n`;
    } else {
      csv = `Tahun,Nilai (${ds.satuan})\n`;
      TAHUN.forEach(t => {
        const v = getValue(validSektor, t);
        csv += `${TAHUN_LABELS[t]},${v != null ? v : ""}\n`;
      });
    }
    triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8" }), `${ds.label}.csv`);
  };

  const handleDownloadExcel = async () => {
    const XLSX = await import("xlsx");
    let rows: (string | number)[][];
    if (filterMode === "tahun") {
      rows = [["Lapangan Usaha/Komponen", `Nilai (${ds.satuan})`]];
      sektors.forEach(s => {
        const v = getValue(s.kode, selectedTahun);
        rows.push([s.nama, v != null ? v : ""]);
      });
      const total = getValue("PDRB", selectedTahun);
      rows.push(["PDRB Total", total != null ? total : ""]);
    } else {
      rows = [["Tahun", `Nilai (${ds.satuan})`]];
      TAHUN.forEach(t => {
        const v = getValue(validSektor, t);
        rows.push([TAHUN_LABELS[t], v != null ? v : ""]);
      });
    }
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${ds.label}.xlsx`);
  };

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
        {loadingData ? (
          <div className="flex items-center justify-center h-48 text-gray-400 dark:text-slate-500 text-sm">Memuat data...</div>
        ) : apiData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-slate-500 text-sm gap-2">
            <BarChart2 className="w-10 h-10 text-gray-200 dark:text-slate-700" />
            <p>Belum ada data. Upload data melalui Admin → Indikator &amp; Data.</p>
            <p className="text-xs">Slug: <code className="bg-gray-100 dark:bg-slate-700 px-1 rounded">{ds.slug}</code></p>
          </div>
        ) : filterMode === "tahun" ? (
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
              onClick={handleDownloadCSV}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700/50 text-xs text-gray-500 dark:text-slate-400 hover:text-green-600 hover:border-green-400 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              onClick={handleDownloadExcel}
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
                      isLaju && row.nilai != null && row.nilai < 0 ? "text-red-500"
                      : isLaju && row.nilai != null && row.nilai > 0 ? "text-emerald-600 dark:text-emerald-400"
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

      {/* ── Kamus Indikator ── */}
      <KamusStatikPanel slug={ds.slug} color={ds.color} />
    </div>
  );
}
