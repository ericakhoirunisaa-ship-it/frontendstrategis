"use client";
import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DynamicChart from "@/components/charts/DynamicChart";
import { indikatorApi } from "@/lib/api";
import {
  BarChart2, LineChart, TrendingUp, Filter,
  Download, FileSpreadsheet, FileText, Image as ImageIcon, FileDown,
  ChevronDown, ChevronRight, BookOpen,
} from "lucide-react";

// Fixed 6 categories — labels/colors never change; sub-indicators come from DB
const CATEGORY_DEFS = [
  { key: "A", label: "Ekonomi",            color: "#1D6FCA", kategori: "Ekonomi" },
  { key: "B", label: "Pembangunan Manusia", color: "#059669", kategori: "Pembangunan Manusia" },
  { key: "C", label: "Gender",             color: "#D97706", kategori: "Gender" },
  { key: "D", label: "Kependudukan",       color: "#7C3AED", kategori: "Kependudukan" },
  { key: "E", label: "Kemiskinan",         color: "#DC2626", kategori: "Kemiskinan" },
  { key: "F", label: "Pertanian",          color: "#16A34A", kategori: "Pertanian" },
] as const;

interface Indikator {
  id: number;
  nama: string;
  slug: string;
  satuan: string;
  kategori: string;
  tipeChart: string;
  deskripsi?: string;
  definisi?: string;
  metodologi?: string;
  sumberData?: string;
  interpretasi?: string;
  filterTahun?: boolean;
  filterDaerah?: boolean;
  filterKolom?: boolean;
}

interface DataPoint {
  id: number;
  tahun: number;
  daerah: string;
  kolom: string;
  nilai: number;
}

const CHART_TYPES = [
  { value: "bar",  icon: BarChart2,  label: "Bar" },
  { value: "line", icon: LineChart,  label: "Line" },
  { value: "area", icon: TrendingUp, label: "Area" },
];

function formatKolom(k: string) {
  return k.replace(/_/g, " ").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildWideRows(data: DataPoint[]) {
  const koloms = [...new Set(data.map((d) => d.kolom))];
  const groups = new Map<string, Record<string, unknown>>();
  for (const dp of data) {
    const key = `${dp.tahun}||${dp.daerah}`;
    if (!groups.has(key)) groups.set(key, { tahun: dp.tahun, daerah: dp.daerah });
    (groups.get(key) as Record<string, unknown>)[dp.kolom] = dp.nilai;
  }
  const rows = [...groups.values()].sort((a, b) => {
    const ta = a.tahun as number, tb = b.tahun as number;
    return ta !== tb ? ta - tb : String(a.daerah).localeCompare(String(b.daerah));
  });
  return { rows, koloms };
}

// ── Download helpers ──────────────────────────────────────────────────────────

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function captureCanvas(container: HTMLElement): Promise<HTMLCanvasElement | null> {
  try {
    const svg = container.querySelector("svg");
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const width = Math.round(rect.width) || svg.clientWidth || 800;
    const height = Math.round(rect.height) || svg.clientHeight || 400;
    const cloned = svg.cloneNode(true) as SVGElement;
    cloned.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    cloned.setAttribute("width", String(width));
    cloned.setAttribute("height", String(height));
    const svgData = new XMLSerializer().serializeToString(cloned);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const scale = 2;
        const canvas = document.createElement("canvas");
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve(canvas);
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  } catch { return null; }
}

async function downloadPNG(ref: React.RefObject<HTMLDivElement | null>, nama: string) {
  if (!ref.current) return;
  const canvas = await captureCanvas(ref.current);
  if (!canvas) return;
  canvas.toBlob((blob) => { if (blob) triggerDownload(blob, `${nama}.png`); }, "image/png");
}

async function downloadPDF(ref: React.RefObject<HTMLDivElement | null>, nama: string) {
  if (!ref.current) return;
  const canvas = await captureCanvas(ref.current);
  if (!canvas) return;
  const imgData = canvas.toDataURL("image/png");
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pw = pdf.internal.pageSize.getWidth();
  const margin = 15;
  pdf.setFontSize(13); pdf.text(nama, margin, margin);
  pdf.setFontSize(8); pdf.setTextColor(120);
  pdf.text("Sumber: BPS Kabupaten Toli-Toli", margin, margin + 6);
  pdf.setTextColor(0);
  const imgW = pw - margin * 2;
  const imgH = (canvas.height / canvas.width) * imgW;
  pdf.addImage(imgData, "PNG", margin, margin + 11, imgW, imgH);
  pdf.save(`${nama}.pdf`);
}

async function downloadWord(ref: React.RefObject<HTMLDivElement | null>, nama: string) {
  if (!ref.current) return;
  const canvas = await captureCanvas(ref.current);
  if (!canvas) return;
  const imgData = canvas.toDataURL("image/png");
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${nama}</title></head><body><h2 style="font-family:Arial;color:#1E3A5F">${nama}</h2><p style="font-size:9pt;color:#666;font-family:Arial">Sumber: BPS Kabupaten Toli-Toli</p><img src="${imgData}" style="width:100%;max-width:650px"/></body></html>`;
  triggerDownload(new Blob(["﻿", html], { type: "application/msword" }), `${nama}.doc`);
}

function downloadCSV(rows: Record<string, unknown>[], koloms: string[], nama: string, isSingle: boolean) {
  const headers = isSingle
    ? ["Kelompok", ...koloms.map(formatKolom)]
    : ["Tahun", "Daerah", ...koloms.map(formatKolom)];
  const body = rows.map((r) => {
    const base = isSingle ? [r.daerah] : [r.tahun, r.daerah];
    return [...base, ...koloms.map((k) => r[k] ?? "")].join(",");
  });
  triggerDownload(
    new Blob([[headers.join(","), ...body].join("\n")], { type: "text/csv;charset=utf-8" }),
    `${nama}.csv`,
  );
}

async function downloadExcel(rows: Record<string, unknown>[], koloms: string[], nama: string, isSingle: boolean) {
  const XLSX = await import("xlsx");
  const headers = isSingle
    ? ["Kelompok", ...koloms.map(formatKolom)]
    : ["Tahun", "Daerah", ...koloms.map(formatKolom)];
  const sheetRows = rows.map((r) => {
    const base = isSingle ? [r.daerah] : [r.tahun, r.daerah];
    return [...base, ...koloms.map((k) => r[k] ?? "")];
  });
  const ws = XLSX.utils.aoa_to_sheet([headers, ...sheetRows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, `${nama}.xlsx`);
}

async function downloadTablePDF(rows: Record<string, unknown>[], koloms: string[], nama: string, isSingle: boolean) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const head = isSingle
    ? [["Kelompok", ...koloms.map(formatKolom)]]
    : [["Tahun", "Daerah", ...koloms.map(formatKolom)]];
  const body = rows.map((r) => {
    const base = isSingle ? [String(r.daerah)] : [String(r.tahun), String(r.daerah)];
    return [...base, ...koloms.map((k) => r[k] != null ? Number(r[k]).toLocaleString("id-ID") : "—")];
  });
  pdf.setFontSize(13); pdf.text(nama, 15, 15);
  pdf.setFontSize(8); pdf.setTextColor(120);
  pdf.text("Sumber: BPS Kabupaten Toli-Toli", 15, 21); pdf.setTextColor(0);
  autoTable(pdf, {
    head, body, startY: 26,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 248, 252] },
  });
  pdf.save(`${nama}.pdf`);
}

// ── Kamus Indikator ───────────────────────────────────────────────────────────

function KamusIndikator({ ind, activeCatColor }: { ind: Indikator; activeCatColor?: string }) {
  const [open, setOpen] = useState(false);

  const entries = [
    { label: "Definisi", value: ind.definisi },
    { label: "Metodologi / Cara Hitung", value: ind.metodologi },
    { label: "Sumber Data", value: ind.sumberData },
    { label: "Interpretasi", value: ind.interpretasi },
  ].filter((e) => e.value);

  if (!entries.length) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2.5">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: (activeCatColor || "#2196F3") + "20" }}
          >
            <BookOpen className="w-4 h-4" style={{ color: activeCatColor || "#2196F3" }} />
          </span>
          <span className="font-semibold text-[#1A1A2E] text-sm">Kamus Indikator</span>
          <span className="text-xs text-gray-400 font-normal">{ind.nama}</span>
        </span>
        {open
          ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
          : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>

      {open && (
        <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-50">
          {entries.map(({ label, value }) => (
            <div key={label} className="pt-4">
              <p
                className="text-[11px] font-bold uppercase tracking-wider mb-1.5"
                style={{ color: activeCatColor || "#2196F3" }}
              >
                {label}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sidebar Category (dynamic from DB) ───────────────────────────────────────

function CategoryGroup({
  cat,
  indikators,
  selectedId,
  onSelect,
  defaultOpen,
}: {
  cat: typeof CATEGORY_DEFS[number];
  indikators: Indikator[];
  selectedId: number | null;
  onSelect: (ind: Indikator) => void;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-0.5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2.5">
          <span
            className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-extrabold text-white shrink-0"
            style={{ backgroundColor: cat.color }}
          >
            {cat.key}
          </span>
          <span className="text-[13px] font-semibold text-gray-700 text-left leading-tight">
            {cat.label}
          </span>
        </span>
        {open
          ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          : <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
      </button>

      {open && (
        <div
          className="ml-3 pl-3 border-l-2 mt-0.5 mb-1 space-y-0.5"
          style={{ borderColor: cat.color + "40" }}
        >
          {indikators.length === 0 ? (
            <p className="px-3 py-2 text-[12px] text-gray-300 italic">Belum ada indikator</p>
          ) : (
            indikators.map((ind) => (
              <button
                key={ind.id}
                onClick={() => onSelect(ind)}
                className={`w-full text-left px-3 py-2 rounded-lg text-[12.5px] transition-colors leading-snug ${
                  selectedId === ind.id
                    ? "font-semibold text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium"
                }`}
                style={selectedId === ind.id ? { backgroundColor: cat.color } : undefined}
              >
                {ind.nama}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DataStrategisPage() {
  const [dbIndikators, setDbIndikators] = useState<Indikator[]>([]);
  const [selectedInd, setSelectedInd] = useState<Indikator | null>(null);
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [chartType, setChartType] = useState("bar");
  // Shared filters — chart and table stay in sync
  const [filterTahun, setFilterTahun] = useState("all");
  const [filterDaerah, setFilterDaerah] = useState("all");
  const [filterKolom, setFilterKolom] = useState("all");
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    indikatorApi.getAll().then((r) => setDbIndikators(r.data));
  }, []);

  // Group DB indicators by kategori (only the 6 fixed categories)
  const kategoriGroups = new Map<string, Indikator[]>(
    CATEGORY_DEFS.map((c) => [c.kategori, []])
  );
  for (const ind of dbIndikators) {
    const group = kategoriGroups.get(ind.kategori);
    if (group) group.push(ind);
  }

  const handleSelect = (ind: Indikator) => {
    setSelectedInd(ind);
    setNotFound(false);
    setLoading(true);
    setData([]);
    setChartType(ind.tipeChart || "bar");
    setFilterTahun("all");
    setFilterDaerah("all");
    setFilterKolom("all");
    indikatorApi.getBySlug(ind.slug).then((r) => {
      const raw: DataPoint[] = r.data.data || [];
      setData(raw);
      const uniqueYears = [...new Set(raw.map((d) => d.tahun))];
      const cols = [...new Set(raw.map((d) => d.kolom))];
      setFilterKolom(uniqueYears.length === 1 ? "all" : (cols[0] || "nilai"));
      setLoading(false);
    }).catch(() => { setNotFound(true); setLoading(false); });
  };

  const activeCat = CATEGORY_DEFS.find((c) => c.kategori === selectedInd?.kategori);
  const showFilterTahun  = selectedInd?.filterTahun  ?? true;
  const showFilterDaerah = selectedInd?.filterDaerah ?? true;
  const showFilterKolom  = selectedInd?.filterKolom  ?? true;

  // Filter options derived from raw data (so dropdowns always show all available options)
  const tahunOptions  = ["all", ...[...new Set(data.map((d) => String(d.tahun)))].sort()];
  const daerahOptions = ["all", ...new Set(data.map((d) => d.daerah))];
  const kolomOptions  = [...new Set(data.map((d) => d.kolom))];

  // Whether raw data spans multiple years (controls showing the tahun dropdown)
  const dataHasMultiYears = new Set(data.map((d) => d.tahun)).size > 1;

  // Data filtered by tahun — passed to DynamicChart; DynamicChart handles daerah/kolom internally
  const tahunFilteredData = filterTahun === "all"
    ? data
    : data.filter((d) => String(d.tahun) === filterTahun);

  // After tahun filter, determine if we're now showing a single year
  const isSingleYear =
    tahunFilteredData.length > 0 &&
    new Set(tahunFilteredData.map((d) => d.tahun)).size === 1;

  // Table data: filtered by both tahun and daerah (same filters as chart)
  const tableData = tahunFilteredData.filter(
    (d) => filterDaerah === "all" || d.daerah === filterDaerah
  );
  const { rows: filteredRows, koloms: filteredKoloms } = buildWideRows(tableData);

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F8FC]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        <div className="mb-8">
          <span className="inline-block px-4 py-1 bg-blue-50 text-[#2196F3] text-sm font-semibold rounded-full mb-3">
            Data Strategis
          </span>
          <h1 className="text-3xl font-bold text-[#1A1A2E]">Data Indikator Strategis</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Pilih kategori dan indikator di panel kiri untuk menampilkan grafik dan tabel data.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ── Sidebar ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 sticky top-6 max-h-[calc(100vh-9rem)] overflow-y-auto">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 py-2">
                Pilih Indikator
              </p>
              {CATEGORY_DEFS.map((cat, i) => (
                <CategoryGroup
                  key={cat.key}
                  cat={cat}
                  indikators={kategoriGroups.get(cat.kategori) || []}
                  selectedId={selectedInd?.id ?? null}
                  onSelect={handleSelect}
                  defaultOpen={false}
                />
              ))}
            </div>
          </div>

          {/* ── Konten Utama ── */}
          <div className="lg:col-span-3 space-y-5">

            {!selectedInd && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center h-72">
                <div className="text-center">
                  <BarChart2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Pilih indikator di panel kiri untuk menampilkan grafik.</p>
                </div>
              </div>
            )}

            {/* ── Grafik ── */}
            {selectedInd && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    {activeCat && (
                      <span
                        className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white mb-1.5"
                        style={{ backgroundColor: activeCat.color }}
                      >
                        {activeCat.key}. {activeCat.label}
                      </span>
                    )}
                    <h2 className="text-xl font-bold text-[#1A1A2E]">{selectedInd.nama}</h2>
                    {selectedInd.deskripsi && (
                      <p className="text-gray-400 text-sm mt-0.5">{selectedInd.deskripsi}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Toggle tipe chart */}
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                      {CHART_TYPES.map(({ value, icon: Icon, label }) => (
                        <button
                          key={value}
                          onClick={() => setChartType(value)}
                          title={label}
                          className={`p-2 rounded-md transition-colors ${
                            chartType === value ? "bg-white shadow text-[#2196F3]" : "text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                    {/* Download grafik */}
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => downloadPNG(chartRef, selectedInd.nama)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 hover:text-[#2196F3] hover:border-[#2196F3] transition-colors"
                        title="Download PNG"
                      >
                        <ImageIcon className="w-3.5 h-3.5" /> PNG
                      </button>
                      <button
                        onClick={() => downloadPDF(chartRef, selectedInd.nama)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 hover:text-red-500 hover:border-red-400 transition-colors"
                        title="Download PDF"
                      >
                        <FileText className="w-3.5 h-3.5" /> PDF
                      </button>
                      <button
                        onClick={() => downloadWord(chartRef, selectedInd.nama)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 hover:text-blue-700 hover:border-blue-400 transition-colors"
                        title="Download Word"
                      >
                        <FileDown className="w-3.5 h-3.5" /> Word
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filter grafik (shared with table) */}
                {!loading && data.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Filter className="w-4 h-4 text-gray-400 shrink-0" />

                      {/* Tahun */}
                      {showFilterTahun && dataHasMultiYears && (
                        <select
                          value={filterTahun}
                          onChange={(e) => setFilterTahun(e.target.value)}
                          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        >
                          {tahunOptions.map((t) => (
                            <option key={t} value={t}>{t === "all" ? "Semua Tahun" : t}</option>
                          ))}
                        </select>
                      )}

                      {/* Daerah */}
                      {showFilterDaerah ? (
                        <select
                          value={filterDaerah}
                          onChange={(e) => setFilterDaerah(e.target.value)}
                          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        >
                          {daerahOptions.map((d) => (
                            <option key={d} value={d}>
                              {d === "all" ? (isSingleYear ? "Semua Kelompok" : "Semua Daerah") : d}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 text-gray-500">
                          {isSingleYear ? "Semua Kelompok" : "Semua Daerah"}
                        </span>
                      )}

                      {/* Kolom */}
                      {showFilterKolom && kolomOptions.length > 1 && (
                        <select
                          value={filterKolom}
                          onChange={(e) => setFilterKolom(e.target.value)}
                          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        >
                          {isSingleYear && <option value="all">Semua Kolom</option>}
                          {kolomOptions.map((k) => (
                            <option key={k} value={k}>{formatKolom(k)}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                )}

                {/* Chart area */}
                <div ref={chartRef} className="bg-white min-h-[300px]">
                  {loading ? (
                    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                      Memuat data...
                    </div>
                  ) : notFound || data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm gap-2">
                      <BarChart2 className="w-10 h-10 text-gray-200" />
                      <p>Belum ada data untuk indikator ini.</p>
                      <p className="text-xs text-gray-300">Upload data melalui halaman Admin → Indikator & Data.</p>
                    </div>
                  ) : (
                    <DynamicChart
                      data={tahunFilteredData}
                      tipeChart={chartType}
                      satuan={selectedInd.satuan || ""}
                      nama={selectedInd.nama}
                      filterDaerah={filterDaerah}
                      filterKolom={filterKolom}
                    />
                  )}
                </div>
              </div>
            )}

            {/* ── Kamus Indikator ── */}
            {selectedInd && !loading && (selectedInd.definisi || selectedInd.metodologi || selectedInd.sumberData || selectedInd.interpretasi) && (
              <KamusIndikator ind={selectedInd} activeCatColor={activeCat?.color} />
            )}

            {/* ── Tabel Data ── */}
            {selectedInd && !loading && data.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h3 className="font-semibold text-[#1A1A2E]">
                    Tabel Data
                    {filteredRows.length > 0 && (
                      <span className="ml-2 text-xs font-normal text-gray-400">{filteredRows.length} baris</span>
                    )}
                  </h3>
                  <div className="flex gap-1.5 flex-wrap">
                    <button
                      onClick={() => downloadCSV(filteredRows, filteredKoloms, selectedInd.nama, isSingleYear)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 hover:text-green-600 hover:border-green-400 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> CSV
                    </button>
                    <button
                      onClick={() => downloadExcel(filteredRows, filteredKoloms, selectedInd.nama, isSingleYear)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 hover:text-green-600 hover:border-green-400 transition-colors"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                    </button>
                    <button
                      onClick={() => downloadTablePDF(filteredRows, filteredKoloms, selectedInd.nama, isSingleYear)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 hover:text-red-500 hover:border-red-400 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" /> PDF
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mb-3">
                  Filter tabel mengikuti filter grafik di atas.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-100">
                        {!isSingleYear && (
                          <th className="text-left py-2.5 px-3 text-gray-500 font-semibold whitespace-nowrap">Tahun</th>
                        )}
                        <th className="text-left py-2.5 px-3 text-gray-500 font-semibold whitespace-nowrap">
                          {isSingleYear ? "Kelompok" : "Daerah"}
                        </th>
                        {filteredKoloms.map((k) => (
                          <th key={k} className="text-right py-2.5 px-3 text-gray-500 font-semibold whitespace-nowrap">
                            {formatKolom(k)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((row, i) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-blue-50/40 transition-colors">
                          {!isSingleYear && (
                            <td className="py-2.5 px-3 text-gray-600 font-medium whitespace-nowrap">{row.tahun as number}</td>
                          )}
                          <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">{row.daerah as string}</td>
                          {filteredKoloms.map((k) => (
                            <td key={k} className="py-2.5 px-3 text-right font-semibold text-[#1A1A2E] whitespace-nowrap">
                              {row[k] != null ? Number(row[k]).toLocaleString("id-ID") : "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
