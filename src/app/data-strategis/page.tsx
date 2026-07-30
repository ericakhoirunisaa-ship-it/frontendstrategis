"use client";
import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DynamicChart from "@/components/charts/DynamicChart";
import { indikatorApi } from "@/lib/api";
import {
  BarChart2, LineChart, TrendingUp, Filter,
  Download, FileSpreadsheet, FileText, Image as ImageIcon, FileDown,
  ChevronDown, ChevronRight, BookOpen, ChevronLeft,
  Share2, Copy, Check,
} from "lucide-react";

const PAGE_SIZE = 10;

// Fixed 6 categories — labels/colors never change; sub-indicators come from DB
const CATEGORY_DEFS = [
  { key: "A", label: "Kependudukan",                    color: "#1D6FCA", kategori: "Kependudukan" },
  { key: "B", label: "Ekonomi",                         color: "#059669", kategori: "Ekonomi" },
  { key: "C", label: "Kemiskinan",                      color: "#D97706", kategori: "Kemiskinan" },
  { key: "D", label: "Ketenagakerjaan",                 color: "#7C3AED", kategori: "Ketenagakerjaan" },
  { key: "E", label: "Indeks Pembangunan Manusia (IPM)", color: "#DC2626", kategori: "Indeks Pembangunan Manusia (IPM)" },
  { key: "F", label: "Pendidikan",                      color: "#16A34A", kategori: "Pendidikan" },
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
  keterangan?: string | null;
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

// Keterangan map: key = "tahun||daerah", value = keterangan pertama yang ada
function buildKeteranganMap(data: DataPoint[]): Map<string, { text: string; id: number }> {
  const map = new Map<string, { text: string; id: number }>();
  for (const dp of data) {
    if (dp.keterangan) {
      const key = `${dp.tahun}||${dp.daerah}`;
      if (!map.has(key)) map.set(key, { text: dp.keterangan, id: dp.id });
    }
  }
  return map;
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

// ── Share Button ─────────────────────────────────────────────────────────────

function ShareButtons({ nama }: { nama: string }) {
  const [open, setOpen]     = useState(false);
  const [copied, setCopied] = useState(false);

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const waText  = encodeURIComponent(`Data ${nama} tersedia di Portal Data Strategis BPS Kabupaten Toli-Toli:\n${pageUrl}`);
  const waUrl   = `https://wa.me/?text=${waText}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700/50 text-xs text-gray-500 dark:text-slate-400 hover:text-purple-600 hover:border-purple-400 transition-colors"
      >
        <Share2 className="w-3.5 h-3.5" /> Bagikan
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-2 right-0 z-20 bg-white dark:bg-[#0F1825] rounded-xl shadow-xl border border-slate-100 dark:border-slate-700/50 py-1.5 min-w-[160px] overflow-hidden">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-green-50 dark:hover:bg-slate-700/30 hover:text-green-700 transition-colors"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-500 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
              {copied ? "Tersalin!" : "Salin Link"}
            </button>
          </div>
        </>
      )}
    </div>
  );
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
    <div className="bg-white dark:bg-[#0F1825] rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
      >
        <span className="flex items-center gap-2.5">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: (activeCatColor || "#2196F3") + "20" }}
          >
            <BookOpen className="w-4 h-4" style={{ color: activeCatColor || "#2196F3" }} />
          </span>
          <span className="font-semibold text-[#1A1A2E] dark:text-white text-sm">Kamus Indikator</span>
          <span className="text-xs text-gray-400 dark:text-slate-500 font-normal">{ind.nama}</span>
        </span>
        {open
          ? <ChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0" />
          : <ChevronRight className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0" />}
      </button>

      {open && (
        <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-50 dark:border-slate-700/50">
          {entries.map(({ label, value }) => (
            <div key={label} className="pt-4">
              <p
                className="text-[11px] font-bold uppercase tracking-wider mb-1.5"
                style={{ color: activeCatColor || "#2196F3" }}
              >
                {label}
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{value}</p>
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
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <span className="flex items-center gap-2.5">
          <span
            className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-extrabold text-white shrink-0"
            style={{ backgroundColor: cat.color }}
          >
            {cat.key}
          </span>
          <span className="text-[13px] font-semibold text-gray-700 dark:text-slate-300 text-left leading-tight">
            {cat.label}
          </span>
        </span>
        {open
          ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 shrink-0" />
          : <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 shrink-0" />}
      </button>

      {open && (
        <div
          className="ml-3 pl-3 border-l-2 mt-0.5 mb-1 space-y-0.5"
          style={{ borderColor: cat.color + "40" }}
        >
          {indikators.length === 0 ? (
            <p className="px-3 py-2 text-[12px] text-gray-300 dark:text-slate-500 italic">Belum ada indikator</p>
          ) : (
            indikators.map((ind) => (
              <button
                key={ind.id}
                onClick={() => onSelect(ind)}
                className={`w-full text-left px-3 py-2 rounded-lg text-[12.5px] transition-colors leading-snug ${
                  selectedId === ind.id
                    ? "font-semibold text-white"
                    : "text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700/50 font-medium"
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
  const [tablePage, setTablePage] = useState(0);
  const [hoveredTip, setHoveredTip] = useState<{ text: string; x: number; y: number } | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);

  // Reset halaman tabel setiap kali indikator atau filter berubah
  useEffect(() => { setTablePage(0); }, [selectedInd, filterTahun, filterDaerah, filterKolom]);

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

  const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE);
  const pagedRows = filteredRows.slice(tablePage * PAGE_SIZE, (tablePage + 1) * PAGE_SIZE);
  const keteranganMap = buildKeteranganMap(tableData);

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F8FC] dark:bg-[#0B1120]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        <div className="mb-8">
          <span className="inline-block px-4 py-1 bg-blue-50 dark:bg-blue-900/30 text-[#2196F3] text-sm font-semibold rounded-full mb-3">
            Data Strategis
          </span>
          <h1 className="text-3xl font-bold text-[#1A1A2E] dark:text-white">Data Indikator Strategis</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm">
            Pilih kategori dan indikator di panel kiri untuk menampilkan grafik dan tabel data.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ── Sidebar ── */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#0F1825] rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-slate-700/50 sticky top-6 max-h-[calc(100vh-9rem)] overflow-y-auto">
              <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest px-3 py-2">
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
              <div className="bg-white dark:bg-[#0F1825] rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm flex items-center justify-center h-72">
                <div className="text-center">
                  <BarChart2 className="w-12 h-12 text-gray-200 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-gray-400 dark:text-slate-500 text-sm">Pilih indikator di panel kiri untuk menampilkan grafik.</p>
                </div>
              </div>
            )}

            {/* ── Grafik ── */}
            {selectedInd && (
              <div className="bg-white dark:bg-[#0F1825] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700/50">
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
                    <h2 className="text-xl font-bold text-[#1A1A2E] dark:text-white">{selectedInd.nama}</h2>
                    {selectedInd.deskripsi && (
                      <p className="text-gray-400 dark:text-slate-500 text-sm mt-0.5">{selectedInd.deskripsi}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Toggle tipe chart */}
                    <div className="flex gap-1 bg-gray-100 dark:bg-[#162133] p-1 rounded-lg">
                      {CHART_TYPES.map(({ value, icon: Icon, label }) => (
                        <button
                          key={value}
                          onClick={() => setChartType(value)}
                          title={label}
                          className={`p-2 rounded-md transition-colors ${
                            chartType === value ? "bg-white dark:bg-[#0F1825] shadow text-[#2196F3]" : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                    {/* Download grafik */}
                    <div className="flex gap-1.5 flex-wrap">
                      <button
                        onClick={() => downloadPNG(chartRef, selectedInd.nama)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700/50 text-xs text-gray-500 dark:text-slate-400 hover:text-[#2196F3] hover:border-[#2196F3] transition-colors"
                        title="Download PNG"
                      >
                        <ImageIcon className="w-3.5 h-3.5" /> PNG
                      </button>
                      <button
                        onClick={() => downloadPDF(chartRef, selectedInd.nama)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700/50 text-xs text-gray-500 dark:text-slate-400 hover:text-red-500 hover:border-red-400 transition-colors"
                        title="Download PDF"
                      >
                        <FileText className="w-3.5 h-3.5" /> PDF
                      </button>
                      <button
                        onClick={() => downloadWord(chartRef, selectedInd.nama)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700/50 text-xs text-gray-500 dark:text-slate-400 hover:text-blue-700 hover:border-blue-400 transition-colors"
                        title="Download Word"
                      >
                        <FileDown className="w-3.5 h-3.5" /> Word
                      </button>
                      <ShareButtons nama={selectedInd.nama} />
                    </div>
                  </div>
                </div>

                {/* Filter grafik (shared with table) */}
                {!loading && data.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Filter className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0" />

                      {/* Tahun */}
                      {showFilterTahun && dataHasMultiYears && (
                        <select
                          value={filterTahun}
                          onChange={(e) => setFilterTahun(e.target.value)}
                          className="text-sm border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-[#162133] text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200"
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
                          className="text-sm border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-[#162133] text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                        >
                          {daerahOptions.map((d) => (
                            <option key={d} value={d}>
                              {d === "all" ? (isSingleYear ? "Semua Kelompok" : "Semua Daerah") : d}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-sm border border-gray-200 dark:border-slate-700/50 rounded-lg px-3 py-1.5 bg-gray-50 dark:bg-[#162133] text-gray-500 dark:text-slate-400">
                          {isSingleYear ? "Semua Kelompok" : "Semua Daerah"}
                        </span>
                      )}

                      {/* Kolom */}
                      {showFilterKolom && kolomOptions.length > 1 && (
                        <select
                          value={filterKolom}
                          onChange={(e) => setFilterKolom(e.target.value)}
                          className="text-sm border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-[#162133] text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200"
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
                <div ref={chartRef} className="bg-white dark:bg-[#0F1825] min-h-[300px]">
                  {loading ? (
                    <div className="flex items-center justify-center h-64 text-gray-400 dark:text-slate-500 text-sm">
                      Memuat data...
                    </div>
                  ) : notFound || data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-slate-500 text-sm gap-2">
                      <BarChart2 className="w-10 h-10 text-gray-200 dark:text-slate-700" />
                      <p>Belum ada data untuk indikator ini.</p>
                      <p className="text-xs text-gray-300 dark:text-slate-500">Upload data melalui halaman Admin → Indikator & Data.</p>
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
              <div className="bg-white dark:bg-[#0F1825] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700/50">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h3 className="font-semibold text-[#1A1A2E] dark:text-white">
                    Tabel Data
                    {filteredRows.length > 0 && (
                      <span className="ml-2 text-xs font-normal text-gray-400 dark:text-slate-500">
                        {tablePage * PAGE_SIZE + 1}–{Math.min((tablePage + 1) * PAGE_SIZE, filteredRows.length)} dari {filteredRows.length} baris
                      </span>
                    )}
                  </h3>
                  <div className="flex gap-1.5 flex-wrap">
                    <button
                      onClick={() => downloadCSV(filteredRows, filteredKoloms, selectedInd.nama, isSingleYear)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700/50 text-xs text-gray-500 dark:text-slate-400 hover:text-green-600 hover:border-green-400 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> CSV
                    </button>
                    <button
                      onClick={() => downloadExcel(filteredRows, filteredKoloms, selectedInd.nama, isSingleYear)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700/50 text-xs text-gray-500 dark:text-slate-400 hover:text-green-600 hover:border-green-400 transition-colors"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                    </button>
                    <button
                      onClick={() => downloadTablePDF(filteredRows, filteredKoloms, selectedInd.nama, isSingleYear)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700/50 text-xs text-gray-500 dark:text-slate-400 hover:text-red-500 hover:border-red-400 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" /> PDF
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
                        {!isSingleYear && (
                          <th className="text-left py-2.5 px-3 text-gray-500 dark:text-slate-400 font-semibold whitespace-nowrap">Tahun</th>
                        )}
                        <th className="text-left py-2.5 px-3 text-gray-500 dark:text-slate-400 font-semibold whitespace-nowrap">
                          {isSingleYear ? "Kelompok" : "Daerah"}
                        </th>
                        {filteredKoloms.map((k) => (
                          <th key={k} className="text-right py-2.5 px-3 text-gray-500 dark:text-slate-400 font-semibold whitespace-nowrap">
                            {formatKolom(k)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedRows.map((row, i) => {
                        const rowKey = `${row.tahun}||${row.daerah}`;
                        const note = keteranganMap.get(rowKey);
                        return (
                          <tr key={i} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-blue-50/40 dark:hover:bg-blue-900/20 transition-colors">
                            {!isSingleYear && (
                              <td className="py-2.5 px-3 text-gray-600 dark:text-slate-300 font-medium whitespace-nowrap">{row.tahun as number}</td>
                            )}
                            <td className="py-2.5 px-3 text-gray-700 dark:text-slate-300 whitespace-nowrap">{row.daerah as string}</td>
                            {filteredKoloms.map((k) => (
                              <td
                                key={k}
                                className="py-2.5 px-3 text-right font-semibold text-[#1A1A2E] dark:text-white whitespace-nowrap"
                                onMouseEnter={note ? (e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setHoveredTip({ text: note.text, x: rect.left + rect.width / 2, y: rect.top });
                                } : undefined}
                                onMouseLeave={note ? () => setHoveredTip(null) : undefined}
                              >
                                <span className={note ? "border-b border-dashed border-[#2196F3]/40 cursor-help" : ""}>
                                  {row[k] != null ? Number(row[k]).toLocaleString("id-ID") : "—"}
                                </span>
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Paginasi */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-slate-700/50">
                    <button
                      onClick={() => setTablePage((p) => Math.max(0, p - 1))}
                      disabled={tablePage === 0}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700/50 text-xs font-semibold text-gray-500 dark:text-slate-400 hover:text-[#2196F3] hover:border-[#2196F3] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i).map((i) => (
                        <button
                          key={i}
                          onClick={() => setTablePage(i)}
                          className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                            i === tablePage
                              ? "bg-[#2196F3] text-white"
                              : "text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700/50"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setTablePage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={tablePage === totalPages - 1}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700/50 text-xs font-semibold text-gray-500 dark:text-slate-400 hover:text-[#2196F3] hover:border-[#2196F3] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Berikutnya <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* Tooltip interpretasi — muncul saat hover angka */}
      {hoveredTip && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: hoveredTip.x,
            top: hoveredTip.y,
            transform: "translateX(-50%) translateY(calc(-100% - 10px))",
          }}
        >
          <div className="bg-[#0C2340] text-white text-xs rounded-xl px-3.5 py-3 shadow-2xl max-w-xs w-max leading-relaxed border border-white/10">
            <p className="text-[#60A5FA] text-[10px] font-bold uppercase tracking-wider mb-1.5">Interpretasi</p>
            <p className="text-white/85">{hoveredTip.text}</p>
          </div>
          <div style={{ width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "6px solid #0C2340", margin: "0 auto" }} />
        </div>
      )}
    </div>
  );
}
