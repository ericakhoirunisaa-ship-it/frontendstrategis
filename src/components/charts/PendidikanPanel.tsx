"use client";
import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
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

// ── Dataset Config ────────────────────────────────────────────────────────────

type PendidikanDatasetId = "apk" | "apm" | "aps";

interface PendidikanDataset {
  id: PendidikanDatasetId;
  nama: string;
  label: string;
  deskripsi: string;
  satuan: string;
  color: string;
  slug: string;
  dimensiLabel: string;
  dimensi: { kode: string; nama: string; short: string }[];
}

const DATASETS: PendidikanDataset[] = [
  {
    id: "apk",
    nama: "Angka Partisipasi Kasar (APK)",
    label: "APK",
    deskripsi: "Perbandingan jumlah siswa pada jenjang pendidikan tertentu dengan penduduk usia sekolah yang sesuai (%)",
    satuan: "%",
    color: "#2196F3",
    slug: "angka-partisipasi-kasar",
    dimensiLabel: "Jenjang",
    dimensi: [
      { kode: "SD",  nama: "Sekolah Dasar (SD)",  short: "SD"  },
      { kode: "SMP", nama: "SMP/MTs",              short: "SMP" },
      { kode: "SMA", nama: "SMA/SMK/MA",           short: "SMA" },
      { kode: "PT",  nama: "Perguruan Tinggi",      short: "PT"  },
    ],
  },
  {
    id: "apm",
    nama: "Angka Partisipasi Murni (APM)",
    label: "APM",
    deskripsi: "Perbandingan jumlah siswa usia sekolah pada jenjang tertentu dengan penduduk usia sekolah yang sesuai (%)",
    satuan: "%",
    color: "#4CAF50",
    slug: "angka-partisipasi-murni",
    dimensiLabel: "Jenjang",
    dimensi: [
      { kode: "SD",  nama: "Sekolah Dasar (SD)",  short: "SD"  },
      { kode: "SMP", nama: "SMP/MTs",              short: "SMP" },
      { kode: "SMA", nama: "SMA/SMK/MA",           short: "SMA" },
      { kode: "PT",  nama: "Perguruan Tinggi",      short: "PT"  },
    ],
  },
  {
    id: "aps",
    nama: "Angka Partisipasi Sekolah (APS)",
    label: "APS",
    deskripsi: "Persentase penduduk usia sekolah yang masih bersekolah pada kelompok umur tertentu (%)",
    satuan: "%",
    color: "#FF9800",
    slug: "angka-partisipasi-sekolah",
    dimensiLabel: "Kelompok Umur",
    dimensi: [
      { kode: "7-12",  nama: "Usia 7–12 Tahun",  short: "7–12"  },
      { kode: "13-15", nama: "Usia 13–15 Tahun", short: "13–15" },
      { kode: "16-18", nama: "Usia 16–18 Tahun", short: "16–18" },
      { kode: "19-24", nama: "Usia 19–24 Tahun", short: "19–24" },
    ],
  },
];

const DIM_COLORS = [
  "#2196F3", "#4CAF50", "#FF9800", "#9C27B0",
];

const CHART_TYPES = [
  { value: "bar",  icon: BarChart2,  label: "Bar"  },
  { value: "line", icon: LineIcon,   label: "Line" },
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

function PendidikanTooltip({ active, payload, label, satuan, namaMap }: any) {
  if (!active || !payload?.length) return null;
  const v: number = payload[0]?.value;
  return (
    <div className="bg-[#0C2340] text-white text-xs rounded-xl px-3.5 py-3 shadow-2xl max-w-[220px] border border-white/10">
      <p className="text-[#60A5FA] text-[10px] font-bold uppercase tracking-wider mb-1 leading-tight">
        {namaMap?.[label] || label}
      </p>
      <p className="font-bold text-white">
        {typeof v === "number" ? v.toLocaleString("id-ID", { maximumFractionDigits: 2 }) : v}{" "}
        {satuan}
      </p>
    </div>
  );
}

// ── Panel Component ───────────────────────────────────────────────────────────

export default function PendidikanPanel({ datasetId }: { datasetId: PendidikanDatasetId }) {
  const [filterMode, setFilterMode]           = useState<"tahun" | "dimensi">("tahun");
  const [selectedTahun, setSelectedTahun]     = useState<number>(2025);
  const [selectedDimensi, setSelectedDimensi] = useState<string>("");
  const [chartType, setChartType]             = useState<"bar" | "line" | "area">("bar");
  const [apiData, setApiData]                 = useState<Array<{ tahun: number; daerah: string; kolom: string; nilai: number }>>([]);
  const [loadingData, setLoadingData]         = useState(false);

  useEffect(() => {
    const next = DATASETS.find((d) => d.id === datasetId)!;
    setFilterMode("tahun");
    setSelectedTahun(2025);
    setSelectedDimensi(next.dimensi[0].kode);
    setChartType("bar");
    setLoadingData(true);
    setApiData([]);
    indikatorApi.getBySlug(next.slug)
      .then(r => setApiData(r.data?.data ?? []))
      .catch(() => setApiData([]))
      .finally(() => setLoadingData(false));
  }, [datasetId]);

  const ds = DATASETS.find((d) => d.id === datasetId)!;
  const sektorLabel = `Per ${ds.dimensiLabel}`;

  const validDimensi = ds.dimensi.some((d) => d.kode === selectedDimensi)
    ? selectedDimensi
    : ds.dimensi[0].kode;

  // Helper to get value from API data
  const getValue = (daerah: string, tahun: number): number | null => {
    const dp = apiData.find(d => d.daerah === daerah && d.tahun === tahun);
    return dp != null ? dp.nilai : null;
  };

  // Chart data — Per Tahun (horizontal bar), keep jenjang order
  const chartDataTahun = [...ds.dimensi]
    .map((s, i) => {
      const v = getValue(s.kode, selectedTahun);
      return {
        short: s.short,
        nama: s.nama,
        nilai: v ?? 0,
        hasData: v != null,
        color: DIM_COLORS[i % DIM_COLORS.length],
      };
    })
    .filter(d => d.hasData);

  // Chart data — Per Dimensi (across years)
  const chartDataDimensi = TAHUN.map((t, i) => ({
    tahun: TAHUN_LABELS[TAHUN[i]],
    nilai: getValue(validDimensi, t) ?? 0,
  }));

  const namaMapTahun = Object.fromEntries(chartDataTahun.map((d) => [d.short, d.nama]));
  const selectedDimensiNama = ds.dimensi.find((d) => d.kode === validDimensi)?.nama || validDimensi;

  // Table rows
  const tableRows =
    filterMode === "tahun"
      ? ds.dimensi.map((d, i) => ({
          label:   d.nama,
          isTotal: false,
          nilai:   getValue(d.kode, selectedTahun),
          color:   DIM_COLORS[i % DIM_COLORS.length],
        }))
      : TAHUN.map((t, i) => ({
          label:   TAHUN_LABELS[TAHUN[i]],
          isTotal: false,
          nilai:   getValue(validDimensi, t),
          color:   ds.color,
        }));

  // Download helpers using apiData
  const handleDownloadCSV = () => {
    let csv = "";
    if (filterMode === "tahun") {
      csv = `${ds.dimensiLabel},Nilai (${ds.satuan})\n`;
      ds.dimensi.forEach((d) => {
        const v = getValue(d.kode, selectedTahun);
        csv += `"${d.nama}",${v != null ? v : ""}\n`;
      });
    } else {
      csv = `Tahun,Nilai (${ds.satuan})\n`;
      TAHUN.forEach(t => {
        const v = getValue(validDimensi, t);
        csv += `${TAHUN_LABELS[t]},${v != null ? v : ""}\n`;
      });
    }
    triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8" }), `${ds.label}.csv`);
  };

  const handleDownloadExcel = async () => {
    const XLSX = await import("xlsx");
    let rows: (string | number)[][];
    if (filterMode === "tahun") {
      rows = [[ds.dimensiLabel, `Nilai (${ds.satuan})`]];
      ds.dimensi.forEach((d) => {
        const v = getValue(d.kode, selectedTahun);
        rows.push([d.nama, v != null ? v : ""]);
      });
    } else {
      rows = [["Tahun", `Nilai (${ds.satuan})`]];
      TAHUN.forEach(t => {
        const v = getValue(validDimensi, t);
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
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white mb-1.5"
              style={{ backgroundColor: ds.color }}
            >
              F. Pendidikan
            </span>
            <h2 className="text-xl font-bold text-[#1A1A2E] dark:text-white">
              {ds.nama}
            </h2>
            <p className="text-gray-400 dark:text-slate-500 text-sm mt-0.5">
              {ds.deskripsi}
            </p>
          </div>

          {/* Chart type toggle (per dimensi mode only) */}
          {filterMode === "dimensi" && (
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

          {/* Per Tahun / Per Dimensi toggle */}
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
              onClick={() => setFilterMode("dimensi")}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                filterMode === "dimensi"
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
              onChange={(e) => setSelectedTahun(Number(e.target.value))}
              className="text-sm border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-[#162133] text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {TAHUN.map((t) => (
                <option key={t} value={t}>{TAHUN_LABELS[t]}</option>
              ))}
            </select>
          ) : (
            <select
              value={validDimensi}
              onChange={(e) => setSelectedDimensi(e.target.value)}
              className="text-sm border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-[#162133] text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200 max-w-xs"
            >
              {ds.dimensi.map((d) => (
                <option key={d.kode} value={d.kode}>{d.nama}</option>
              ))}
            </select>
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
          <ResponsiveContainer width="100%" height={ds.dimensi.length * 46 + 30}>
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
                tickFormatter={(v) => v.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
              />
              <YAxis
                type="category" dataKey="short"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false} axisLine={false}
                width={60}
              />
              <Tooltip
                content={<PendidikanTooltip satuan={ds.satuan} namaMap={namaMapTahun} />}
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
              />
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
            <BarChart data={chartDataDimensi} margin={{ left: 10, right: 20, top: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="tahun" tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false}
                tickFormatter={(v) => v.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
              />
              <Tooltip content={<PendidikanTooltip satuan={ds.satuan} />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
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
            <LineChart data={chartDataDimensi} margin={{ left: 10, right: 20, top: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="tahun" tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false}
                tickFormatter={(v) => v.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
              />
              <Tooltip content={<PendidikanTooltip satuan={ds.satuan} />}
                cursor={{ stroke: ds.color, strokeWidth: 1, strokeDasharray: "4 2" }}
              />
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
            <AreaChart data={chartDataDimensi} margin={{ left: 10, right: 20, top: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="pendidikanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={ds.color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={ds.color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="tahun" tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false}
                tickFormatter={(v) => v.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
              />
              <Tooltip content={<PendidikanTooltip satuan={ds.satuan} />}
                cursor={{ stroke: ds.color, strokeWidth: 1, strokeDasharray: "4 2" }}
              />
              <Area type="monotone" dataKey="nilai" stroke={ds.color} strokeWidth={2.5}
                fill="url(#pendidikanGrad)"
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
                ? `${TAHUN_LABELS[selectedTahun]} — Seluruh ${ds.dimensiLabel}`
                : `${selectedDimensiNama} — 2021 s.d. 2025`}
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
                  {filterMode === "tahun" ? ds.dimensiLabel : "Tahun"}
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
                  className="border-b border-gray-50 dark:border-slate-700/50 transition-colors hover:bg-blue-50/40 dark:hover:bg-blue-900/20"
                >
                  <td className="py-2.5 px-3 text-gray-600 dark:text-slate-300">
                    {filterMode === "tahun" && (
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-2 shrink-0 align-middle"
                        style={{ backgroundColor: row.color }}
                      />
                    )}
                    {row.label}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <span className="font-semibold text-[#1A1A2E] dark:text-white">
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
          — Data tidak tersedia &nbsp;|&nbsp; Sumber: BPS Kabupaten Toli-Toli
        </p>
      </div>

      {/* ── Kamus Indikator ── */}
      <KamusStatikPanel slug={ds.slug} color={ds.color} />
    </div>
  );
}

export type { PendidikanDatasetId };
