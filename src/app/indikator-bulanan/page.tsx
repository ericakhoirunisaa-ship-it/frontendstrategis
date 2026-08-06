"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { indikatorBulananApi } from "@/lib/api";
import { TrendingUp, TrendingDown, Minus, BarChart2, ChevronLeft, ChevronRight, Zap, FileText, Image as ImageIcon } from "lucide-react";

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

// ── Shared layout helpers ─────────────────────────────────────────────────────

function buildGrouped(
  items: IndikatorBulanan[],
  bulan: number,
  tahun: number,
): [string, IndikatorBulanan[]][] {
  const grouped: [string, IndikatorBulanan[]][] = [];
  const seen = new Map<string, IndikatorBulanan[]>();
  for (const item of items) {
    const key = item.periode?.trim() || `${BULAN_LABEL[bulan]} ${tahun}`;
    if (!seen.has(key)) { const a: IndikatorBulanan[] = []; seen.set(key, a); grouped.push([key, a]); }
    seen.get(key)!.push(item);
  }
  return grouped;
}

function computeCardH(
  grouped: [string, IndikatorBulanan[]][],
  availH: number,
  labelH: number, gapAfterLabel: number, interGroupGap: number, gapY: number,
): number {
  const nGroups  = grouped.length;
  const totalRows = grouped.reduce((s, [, c]) => s + Math.ceil(c.length / 2), 0);
  const labelSpace = nGroups * (labelH + gapAfterLabel) + Math.max(0, nGroups - 1) * interGroupGap;
  const raw = totalRows > 0
    ? (availH - labelSpace - Math.max(0, totalRows - 1) * gapY) / totalRows
    : 30;
  return Math.max(16, Math.min(30, raw));
}

async function loadImageDataUrl(src: string): Promise<string | null> {
  try {
    const res = await fetch(src);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch { return null; }
}

// ── PDF Download ──────────────────────────────────────────────────────────────

async function downloadRingkasanPDF(
  items: IndikatorBulanan[],
  bulan: number,
  tahun: number,
) {
  if (!items.length) return;
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pw = 210, ph = 297, ml = 10, mr = 10, cw = pw - ml - mr;

  const hex2rgb = (hex: string): [number, number, number] => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];

  const logoDataUrl = await loadImageDataUrl("/bps-logo.jpg");

  // ── Header ─────────────────────────────────────────────────
  if (logoDataUrl) pdf.addImage(logoDataUrl, "JPEG", ml, 5, 18, 18);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(0, 82, 165);
  pdf.text("BADAN PUSAT STATISTIK", ml + 21, 11);
  pdf.setFontSize(8);
  pdf.text("KABUPATEN TOLI-TOLI", ml + 21, 17);
  pdf.setDrawColor(0, 82, 165);
  pdf.setLineWidth(0.6);
  pdf.line(ml, 25, pw - mr, 25);
  pdf.setLineWidth(0.15);
  pdf.setDrawColor(200, 200, 200);
  pdf.line(ml, 26, pw - mr, 26);

  // ── Judul ──────────────────────────────────────────────────
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(17);
  pdf.setTextColor(234, 88, 12);
  pdf.text("RINGKASAN INDIKATOR STRATEGIS", pw / 2, 35, { align: "center" });
  pdf.setFontSize(11);
  pdf.setTextColor(0, 82, 165);
  pdf.text("KABUPATEN TOLI-TOLI", pw / 2, 42, { align: "center" });

  // ── Footer ─────────────────────────────────────────────────
  const drawFooter = () => {
    const fy = ph - 20;
    pdf.setFillColor(255, 247, 237);
    pdf.setDrawColor(253, 186, 116);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(ml, fy, cw, 12, 2, 2, "FD");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.setTextColor(154, 52, 18);
    pdf.text("Informasi lebih lanjut kunjungi:", ml + 4, fy + 5);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(29, 111, 202);
    pdf.text("https://strategis7206.zeabur.app/", ml + 4, fy + 10);
    pdf.text("https://tolitolikab.bps.go.id/id", pw / 2 + 4, fy + 10);
    const dy = ph - 5;
    ([
      [0, 82, 165], [234, 88, 12], [5, 150, 105],
    ] as [number, number, number][]).forEach(([r, g, b], i) => {
      pdf.setFillColor(r, g, b); pdf.circle(ml + i * 6, dy, 1.8, "F");
    });
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(8); pdf.setTextColor(80, 80, 80);
    pdf.text("tolitolikab.bps.go.id", pw - mr, dy + 1, { align: "right" });
  };

  // ── Layout ─────────────────────────────────────────────────
  const grouped = buildGrouped(items, bulan, tahun);
  const cardsStart = 46, footerTop = ph - 22;
  const labelH = 8, gapAfterLabel = 2, interGroupGap = 4, gapX = 4, gapY = 2;
  const cardH = computeCardH(grouped, footerTop - cardsStart, labelH, gapAfterLabel, interGroupGap, gapY);
  const hdrH = Math.min(8, cardH * 0.38);
  const valueFsz = cardH >= 24 ? 13 : cardH >= 20 ? 11 : 9;
  const changeFsz = cardH >= 20 ? 6.5 : 6;
  const cardW = (cw - gapX) / 2;

  const drawCard = (item: IndikatorBulanan, x: number, y: number) => {
    const wc = WARNA_MAP[item.warna] ?? WARNA_MAP.biru;
    const [bgR, bgG, bgB] = hex2rgb(wc.bg);
    const [sfR, sfG, sfB] = hex2rgb(wc.soft);
    const [brR, brG, brB] = hex2rgb(wc.border);
    pdf.setFillColor(sfR, sfG, sfB); pdf.setDrawColor(brR, brG, brB);
    pdf.setLineWidth(0.25); pdf.roundedRect(x, y, cardW, cardH, 2, 2, "FD");
    pdf.setFillColor(bgR, bgG, bgB);
    pdf.roundedRect(x, y, cardW, hdrH, 2, 2, "F");
    pdf.rect(x, y + hdrH - 2, cardW, 2, "F");
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(6); pdf.setTextColor(255, 255, 255);
    pdf.text(pdf.splitTextToSize(item.judul.toUpperCase(), cardW - 4)[0], x + 2, y + hdrH * 0.72);
    const bodyTop = y + hdrH, bodyH = cardH - hdrH;
    const valueY = bodyTop + bodyH * 0.58;
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(valueFsz); pdf.setTextColor(12, 35, 64);
    pdf.text(item.nilai, x + 2.5, valueY);
    if (item.satuan) {
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(5.5); pdf.setTextColor(100, 100, 100);
      pdf.text(item.satuan, x + 2.5 + pdf.getTextWidth(item.nilai) + 0.8, valueY);
    }
    const changeY = bodyTop + bodyH * 0.88;
    if (item.perubahan) {
      const naik = item.arahPerubahan === "naik", turun = item.arahPerubahan === "turun";
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(changeFsz);
      pdf.setTextColor(naik ? 5 : turun ? 220 : 100, naik ? 150 : turun ? 38 : 100, naik ? 105 : turun ? 38 : 100);
      pdf.text(item.perubahan, x + 2.5, changeY);
    } else {
      const note = (item.keterangan ?? item.periode ?? "").trim();
      if (note) { pdf.setFont("helvetica", "normal"); pdf.setFontSize(5.5); pdf.setTextColor(100, 100, 100); pdf.text(pdf.splitTextToSize(note, cardW - 5)[0], x + 2.5, changeY); }
    }
  };

  let y = cardsStart;
  for (let gi = 0; gi < grouped.length; gi++) {
    const [periode, cards] = grouped[gi];
    pdf.setFillColor(254, 243, 199); pdf.setDrawColor(251, 191, 36);
    pdf.setLineWidth(0.25); pdf.roundedRect(ml, y, cw, labelH, 1.5, 1.5, "FD");
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(7.5); pdf.setTextColor(92, 60, 0);
    pdf.text(periode, ml + 3.5, y + labelH * 0.7);
    y += labelH + gapAfterLabel;
    let col = 0;
    for (const item of cards) {
      if (col === 2) { col = 0; y += cardH + gapY; }
      drawCard(item, ml + col * (cardW + gapX), y); col++;
    }
    y += cardH + (gi < grouped.length - 1 ? interGroupGap : 0);
  }

  drawFooter();
  pdf.save(`Ringkasan-Indikator-Strategis-${BULAN_LABEL[bulan]}-${tahun}.pdf`);
}

// ── PNG Download (Canvas 2D) ──────────────────────────────────────────────────

async function downloadRingkasanPNG(
  items: IndikatorBulanan[],
  bulan: number,
  tahun: number,
) {
  if (!items.length) return;

  // A4 portrait at 150dpi: 1mm = 150/25.4 ≈ 5.906px
  const DPI = 150;
  const MM  = DPI / 25.4;
  const CW  = Math.round(210 * MM);   // 1240px
  const CH  = Math.round(297 * MM);   // 1754px

  const canvas = document.createElement("canvas");
  canvas.width  = CW;
  canvas.height = CH;
  const ctx = canvas.getContext("2d")!;

  const p = (mm: number) => mm * MM;

  // helper: rounded rect path
  const rr = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  // pt → px at DPI
  const pt = (size: number) => size * DPI / 72;

  // text wrap helper
  const wrapText = (text: string, maxW: number): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
      else line = test;
    }
    if (line) lines.push(line);
    return lines;
  };

  // white background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, CW, CH);

  const ml = p(10), mr = p(10), cw = CW - ml - mr;

  // ── Load logo BPS ─────────────────────────────────────────
  let logoImg: HTMLImageElement | null = null;
  try {
    logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = "/bps-logo.jpg";
    });
  } catch { /* no logo */ }

  // ── Header ────────────────────────────────────────────────
  if (logoImg) ctx.drawImage(logoImg, ml, p(5), p(18), p(18));
  ctx.fillStyle = "#0052A5";
  ctx.font = `bold ${pt(8.5)}px Arial`;
  ctx.fillText("BADAN PUSAT STATISTIK", ml + p(21), p(11));
  ctx.font = `bold ${pt(8)}px Arial`;
  ctx.fillText("KABUPATEN TOLI-TOLI", ml + p(21), p(17));
  ctx.strokeStyle = "#0052A5"; ctx.lineWidth = p(0.6);
  ctx.beginPath(); ctx.moveTo(ml, p(25)); ctx.lineTo(CW - mr, p(25)); ctx.stroke();
  ctx.strokeStyle = "#C8C8C8"; ctx.lineWidth = p(0.15);
  ctx.beginPath(); ctx.moveTo(ml, p(26)); ctx.lineTo(CW - mr, p(26)); ctx.stroke();

  // ── Judul ─────────────────────────────────────────────────
  ctx.textAlign = "center";
  ctx.font = `bold ${pt(17)}px Arial`;
  ctx.fillStyle = "#EA580C";
  ctx.fillText("RINGKASAN INDIKATOR STRATEGIS", CW / 2, p(35));
  ctx.font = `bold ${pt(11)}px Arial`;
  ctx.fillStyle = "#0052A5";
  ctx.fillText("KABUPATEN TOLI-TOLI", CW / 2, p(42));
  ctx.textAlign = "left";

  // ── Layout calculation ────────────────────────────────────
  const grouped = buildGrouped(items, bulan, tahun);
  const cardsStart = p(46), footerTop = p(297 - 22);
  const labelH = p(8), gapAfterLabel = p(2), interGroupGap = p(4);
  const gapX = p(4), gapY = p(2);
  const cardHmm = computeCardH(
    grouped, 297 - 22 - 46, 8, 2, 4, 2,
  );
  const cardH = p(cardHmm);
  const hdrH  = Math.min(p(8), cardH * 0.38);
  const valueFsz = cardHmm >= 24 ? pt(13) : cardHmm >= 20 ? pt(11) : pt(9);
  const changeFsz = cardHmm >= 20 ? pt(6.5) : pt(6);
  const cardW = (cw - gapX) / 2;

  // ── Draw card ─────────────────────────────────────────────
  const drawCard = (item: IndikatorBulanan, x: number, y: number) => {
    const wc = WARNA_MAP[item.warna] ?? WARNA_MAP.biru;

    // Shell
    rr(x, y, cardW, cardH, p(2));
    ctx.fillStyle = wc.soft; ctx.fill();
    ctx.strokeStyle = wc.border; ctx.lineWidth = p(0.25); ctx.stroke();

    // Colored header
    rr(x, y, cardW, hdrH, p(2));
    ctx.fillStyle = wc.bg; ctx.fill();
    ctx.fillRect(x, y + hdrH - p(2), cardW, p(2));

    // Title in header
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${pt(6)}px Arial`;
    const titleLine = wrapText(item.judul.toUpperCase(), cardW - p(4))[0] ?? item.judul;
    ctx.fillText(titleLine, x + p(2), y + hdrH * 0.72);

    // Value
    const bodyTop = y + hdrH, bodyH = cardH - hdrH;
    const valY = bodyTop + bodyH * 0.58;
    ctx.font = `bold ${valueFsz}px Arial`;
    ctx.fillStyle = "#0C2340";
    ctx.fillText(item.nilai, x + p(2.5), valY);

    // Satuan
    if (item.satuan) {
      const vw = ctx.measureText(item.nilai).width;
      ctx.font = `${pt(5.5)}px Arial`;
      ctx.fillStyle = "#646464";
      ctx.fillText(item.satuan, x + p(2.5) + vw + p(0.8), valY);
    }

    // Perubahan / keterangan
    const chY = bodyTop + bodyH * 0.88;
    if (item.perubahan) {
      const naik = item.arahPerubahan === "naik", turun = item.arahPerubahan === "turun";
      ctx.font = `bold ${changeFsz}px Arial`;
      ctx.fillStyle = naik ? "#059669" : turun ? "#DC2626" : "#646464";
      ctx.fillText(item.perubahan, x + p(2.5), chY);
    } else {
      const note = (item.keterangan ?? item.periode ?? "").trim();
      if (note) {
        ctx.font = `${pt(5.5)}px Arial`;
        ctx.fillStyle = "#646464";
        ctx.fillText(wrapText(note, cardW - p(5))[0] ?? note, x + p(2.5), chY);
      }
    }
  };

  // ── Render groups & cards ─────────────────────────────────
  let y = cardsStart;
  for (let gi = 0; gi < grouped.length; gi++) {
    const [periode, cards] = grouped[gi];

    // Period label (yellow)
    rr(ml, y, cw, labelH, p(1.5));
    ctx.fillStyle = "#FEF3C7"; ctx.fill();
    ctx.strokeStyle = "#FBBF24"; ctx.lineWidth = p(0.25); ctx.stroke();
    ctx.font = `bold ${pt(7.5)}px Arial`;
    ctx.fillStyle = "#5C3C00";
    ctx.fillText(periode, ml + p(3.5), y + labelH * 0.7);
    y += labelH + gapAfterLabel;

    let col = 0;
    for (const item of cards) {
      if (col === 2) { col = 0; y += cardH + gapY; }
      drawCard(item, ml + col * (cardW + gapX), y); col++;
    }
    y += cardH + (gi < grouped.length - 1 ? interGroupGap : 0);
  }

  // ── Footer ────────────────────────────────────────────────
  const fy = p(297 - 20);
  rr(ml, fy, cw, p(12), p(2));
  ctx.fillStyle = "#FFF7ED"; ctx.fill();
  ctx.strokeStyle = "#FDBA74"; ctx.lineWidth = p(0.3); ctx.stroke();
  ctx.font = `bold ${pt(7.5)}px Arial`; ctx.fillStyle = "#9A3412";
  ctx.fillText("Informasi lebih lanjut kunjungi:", ml + p(4), fy + p(5));
  ctx.font = `${pt(7)}px Arial`; ctx.fillStyle = "#1D6FCA";
  ctx.fillText("https://strategis7206.zeabur.app/", ml + p(4), fy + p(10));
  ctx.fillText("https://tolitolikab.bps.go.id/id", CW / 2 + p(4), fy + p(10));

  const dy = p(297 - 5);
  [[0, 82, 165], [234, 88, 12], [5, 150, 105]].forEach(([r, g, b], i) => {
    ctx.beginPath(); ctx.arc(ml + p(i * 6), dy, p(1.8), 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${r},${g},${b})`; ctx.fill();
  });
  ctx.textAlign = "right"; ctx.font = `bold ${pt(8)}px Arial`; ctx.fillStyle = "#505050";
  ctx.fillText("tolitolikab.bps.go.id", CW - mr, dy + p(1));
  ctx.textAlign = "left";

  // ── Export PNG ────────────────────────────────────────────
  canvas.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Ringkasan-Indikator-Strategis-${BULAN_LABEL[bulan]}-${tahun}.png`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
  }, "image/png");
}

// ── StatCard ──────────────────────────────────────────────────────────────────

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

              {/* Download PDF */}
              <button
                onClick={() => downloadRingkasanPDF(items, bulan, tahun)}
                disabled={loading || items.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                title="Download PDF Ringkasan Indikator Strategis"
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>

              {/* Download PNG */}
              <button
                onClick={() => downloadRingkasanPNG(items, bulan, tahun)}
                disabled={loading || items.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                title="Download PNG Ringkasan Indikator Strategis"
              >
                <ImageIcon className="w-4 h-4" />
                PNG
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
