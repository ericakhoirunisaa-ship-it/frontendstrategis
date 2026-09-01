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
    : 38;
  return Math.max(18, Math.min(40, raw));
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

  const h2r = (hex: string): [number, number, number] => [
    parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16),
  ];

  // ── Judul ──────────────────────────────────────────────────
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(234, 88, 12);
  pdf.text("RINGKASAN INDIKATOR STRATEGIS", pw / 2, 14, { align: "center" });
  pdf.setFontSize(11);
  pdf.setTextColor(0, 40, 120);
  pdf.text("KABUPATEN TOLI-TOLI", pw / 2, 21, { align: "center" });
  // Garis dekoratif oranye
  pdf.setDrawColor(234, 88, 12);
  pdf.setLineWidth(0.8);
  pdf.line(pw / 2 - 38, 24, pw / 2 + 38, 24);

  // ── Layout ─────────────────────────────────────────────────
  const grouped = buildGrouped(items, bulan, tahun);
  const cardsStart = 29, footerTop = ph - 5;
  const labelH = 9, gapAfterLabel = 3, interGroupGap = 6, gapX = 5, gapY = 3;
  const cardHmm = computeCardH(grouped, footerTop - cardsStart, labelH, gapAfterLabel, interGroupGap, gapY);
  const cardW = (cw - gapX) / 2;
  const hdrH = Math.min(12, cardHmm * 0.42);

  // Font sizes berdasarkan tinggi kartu
  const titleFsz = 6.5;
  const valueFsz = cardHmm >= 34 ? 16 : cardHmm >= 26 ? 13 : cardHmm >= 20 ? 10 : 8;
  const satuanFsz = 6;
  const changeFsz = cardHmm >= 24 ? 7.5 : 6.5;

  const drawCard = (item: IndikatorBulanan, x: number, y: number) => {
    const wc = WARNA_MAP[item.warna] ?? WARNA_MAP.biru;
    const [bgR,bgG,bgB] = h2r(wc.bg);
    const [sfR,sfG,sfB] = h2r(wc.soft);
    const [brR,brG,brB] = h2r(wc.border);

    // Bayangan (fake: kotak abu offset)
    pdf.setFillColor(210, 215, 225);
    pdf.roundedRect(x + 0.5, y + 0.5, cardW, cardHmm, 2.5, 2.5, "F");

    // Shell kartu (background lembut)
    pdf.setFillColor(sfR, sfG, sfB);
    pdf.setDrawColor(brR, brG, brB);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(x, y, cardW, cardHmm, 2.5, 2.5, "FD");

    // Header berwarna (atas rounded, bawah kotak)
    pdf.setFillColor(bgR, bgG, bgB);
    pdf.roundedRect(x, y, cardW, hdrH, 2.5, 2.5, "F");
    pdf.rect(x, y + 2, cardW, hdrH - 2, "F"); // tutup sudut bawah header

    // Garis tipis pemisah header-body
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(0.15);
    pdf.line(x, y + hdrH, x + cardW, y + hdrH);

    // Judul di header
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(titleFsz);
    const titleLine = pdf.splitTextToSize(item.judul.toUpperCase(), cardW - 5)[0];
    pdf.text(titleLine, x + 2.5, y + hdrH * 0.68);

    // Body
    const bodyTop = y + hdrH, bodyH = cardHmm - hdrH;
    const valY = bodyTop + bodyH * 0.56;
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(valueFsz); pdf.setTextColor(10, 30, 80);
    pdf.text(item.nilai, x + 3, valY);

    if (item.satuan) {
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(satuanFsz); pdf.setTextColor(120, 120, 120);
      pdf.text(item.satuan, x + 3 + pdf.getTextWidth(item.nilai) + 2.5, valY - 0.5);
    }

    const chY = bodyTop + bodyH * 0.87;
    if (item.perubahan) {
      const naik = item.arahPerubahan === "naik", turun = item.arahPerubahan === "turun";
      const [cr,cg,cb] = naik ? [5,120,90] : turun ? [200,30,30] : [100,100,100];
      // Segitiga arah
      const tx = x + 3, ty = chY - 1.8;
      pdf.setFillColor(cr, cg, cb);
      if (naik) {
        pdf.triangle(tx, ty + 2.5, tx + 1.5, ty, tx + 3, ty + 2.5, "F");
      } else if (turun) {
        pdf.triangle(tx, ty, tx + 1.5, ty + 2.5, tx + 3, ty, "F");
      }
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(changeFsz);
      pdf.setTextColor(cr, cg, cb);
      pdf.text(item.perubahan, x + 7.5, chY);
    } else {
      const note = (item.keterangan ?? item.periode ?? "").trim();
      if (note) {
        pdf.setFont("helvetica", "normal"); pdf.setFontSize(5.5); pdf.setTextColor(110, 110, 110);
        pdf.text(pdf.splitTextToSize(note, cardW - 6)[0], x + 3, chY);
      }
    }
  };

  let y = cardsStart;
  for (let gi = 0; gi < grouped.length; gi++) {
    const [periode, cards] = grouped[gi];
    // Label periode — dengan aksen kiri berwarna
    pdf.setFillColor(254, 243, 199); pdf.setDrawColor(251, 191, 36);
    pdf.setLineWidth(0.3); pdf.roundedRect(ml, y, cw, labelH, 2, 2, "FD");
    pdf.setFillColor(217, 119, 6); pdf.roundedRect(ml, y, 3, labelH, 1, 1, "F");
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(8); pdf.setTextColor(92, 60, 0);
    pdf.text(periode, ml + 5.5, y + labelH * 0.69);
    y += labelH + gapAfterLabel;

    let col = 0;
    for (const item of cards) {
      if (col === 2) { col = 0; y += cardHmm + gapY; }
      drawCard(item, ml + col * (cardW + gapX), y); col++;
    }
    y += cardHmm + (gi < grouped.length - 1 ? interGroupGap : 0);
  }

  pdf.save(`Ringkasan-Indikator-Strategis-${BULAN_LABEL[bulan]}-${tahun}.pdf`);
}

// ── PNG Download (Canvas 2D — Infografis) ────────────────────────────────────

async function downloadRingkasanPNG(
  items: IndikatorBulanan[],
  bulan: number,
  tahun: number,
) {
  if (!items.length) return;

  const DPI = 150, MM = DPI / 25.4;
  const p = (mm: number) => mm * MM;
  const pt = (sz: number) => Math.round(sz * DPI / 72);
  const CW = Math.round(p(210)), CH = Math.round(p(297));

  const canvas = document.createElement("canvas");
  canvas.width = CW; canvas.height = CH;
  const ctx = canvas.getContext("2d")!;

  // ── Helpers ─────────────────────────────────────────────
  const rrPath = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  // Rounded rect dengan rounded corners hanya di atas
  const topRRPath = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  };

  const setShadow = (blur: number, color: string, oy = 0) => {
    ctx.shadowBlur = blur; ctx.shadowColor = color; ctx.shadowOffsetY = oy; ctx.shadowOffsetX = 0;
  };
  const clearShadow = () => setShadow(0, "transparent");

  const wrapLine = (text: string, maxW: number): string => {
    const words = text.split(" ");
    let line = "";
    for (const w of words) {
      const t = line ? line + " " + w : w;
      if (ctx.measureText(t).width > maxW && line) break;
      line = t;
    }
    return line || text;
  };

  // ── Latar halaman ──────────────────────────────────────
  ctx.fillStyle = "#EEF2F8";
  ctx.fillRect(0, 0, CW, CH);
  // Panel putih (isi halaman)
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(p(5), 0, CW - p(10), CH);

  const PAD = p(12), cw = CW - PAD * 2;

  // ── Judul ─────────────────────────────────────────────
  const TITLE_TOP = p(8);
  ctx.textAlign = "center";
  ctx.font = `bold ${pt(20)}px Arial, sans-serif`;
  ctx.fillStyle = "#EA580C";
  ctx.fillText("RINGKASAN INDIKATOR STRATEGIS", CW / 2, TITLE_TOP + pt(20));
  ctx.font = `bold ${pt(12)}px Arial, sans-serif`;
  ctx.fillStyle = "#00287A";
  ctx.fillText("KABUPATEN TOLI-TOLI", CW / 2, TITLE_TOP + pt(20) + pt(14));
  // Garis dekoratif
  const SEP_Y = TITLE_TOP + pt(20) + pt(14) + p(5);
  ctx.strokeStyle = "#EA580C"; ctx.lineWidth = p(0.8);
  ctx.beginPath(); ctx.moveTo(CW/2 - p(45), SEP_Y); ctx.lineTo(CW/2 + p(45), SEP_Y); ctx.stroke();
  ctx.textAlign = "left";

  const CARDS_START = SEP_Y + p(8);

  // ── Layout calculation ─────────────────────────────────
  const grouped = buildGrouped(items, bulan, tahun);
  const LABEL_H  = p(9),  GAP_AL  = p(3), IG_GAP = p(6);
  const GAP_X    = p(5),  GAP_Y   = p(3);
  const FOOTER_TOP = p(288);

  const cardHmm = computeCardH(grouped, (FOOTER_TOP - CARDS_START) / MM, 9, 3, 6, 3);
  const CARD_H  = p(cardHmm);
  const CARD_W  = (cw - GAP_X) / 2;
  const HDR_H   = Math.min(p(13), CARD_H * 0.42);
  const R       = p(3.5);

  const valueFsz = cardHmm >= 34 ? pt(17) : cardHmm >= 26 ? pt(14) : cardHmm >= 20 ? pt(11) : pt(9);
  const changeFsz = cardHmm >= 26 ? pt(8.5) : pt(7);
  const titleFsz  = pt(7);

  // ── Draw card ──────────────────────────────────────────
  const drawCard = (item: IndikatorBulanan, x: number, y: number) => {
    const wc = WARNA_MAP[item.warna] ?? WARNA_MAP.biru;

    // Shadow
    setShadow(p(3.5), "rgba(0,0,0,0.14)", p(2));
    rrPath(x, y, CARD_W, CARD_H, R);
    ctx.fillStyle = "#FFFFFF"; ctx.fill();
    clearShadow();

    // Soft border
    rrPath(x, y, CARD_W, CARD_H, R);
    ctx.strokeStyle = wc.border; ctx.lineWidth = p(0.3); ctx.stroke();

    // Header berwarna (atas rounded, bawah datar)
    topRRPath(x, y, CARD_W, HDR_H, R);
    ctx.fillStyle = wc.bg; ctx.fill();

    // Shimmer putih tipis di header
    const shimmer = ctx.createLinearGradient(x, y, x, y + HDR_H);
    shimmer.addColorStop(0, "rgba(255,255,255,0.18)");
    shimmer.addColorStop(1, "rgba(255,255,255,0.0)");
    topRRPath(x, y, CARD_W, HDR_H, R);
    ctx.fillStyle = shimmer; ctx.fill();

    // Judul di header
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `bold ${titleFsz}px Arial, sans-serif`;
    ctx.fillText(wrapLine(item.judul.toUpperCase(), CARD_W - p(5)), x + p(3), y + HDR_H * 0.67);

    // Body content
    const bodyTop = y + HDR_H, bodyH = CARD_H - HDR_H;
    const valY    = bodyTop + bodyH * 0.54;

    ctx.font     = `bold ${valueFsz}px Arial, sans-serif`;
    ctx.fillStyle = "#0A1E50";
    ctx.fillText(item.nilai, x + p(3), valY);

    if (item.satuan) {
      const vw = ctx.measureText(item.nilai).width;
      ctx.font = `${pt(6.5)}px Arial, sans-serif`;
      ctx.fillStyle = "#888";
      ctx.textBaseline = "bottom";
      ctx.fillText(item.satuan, x + p(3) + vw + p(2.5), valY);
      ctx.textBaseline = "alphabetic";
    }

    const chY = bodyTop + bodyH * 0.86;
    if (item.perubahan) {
      const naik  = item.arahPerubahan === "naik";
      const turun = item.arahPerubahan === "turun";
      const color = naik ? "#059669" : turun ? "#DC2626" : "#6B7280";
      // Segitiga panah
      const TRI = pt(changeFsz / pt(1)) * 0.38;
      const tx = x + p(3) + TRI, ty = chY - TRI * 0.6;
      ctx.beginPath();
      if (naik) {
        ctx.moveTo(tx, ty - TRI); ctx.lineTo(tx + TRI, ty + TRI * 0.65); ctx.lineTo(tx - TRI, ty + TRI * 0.65);
      } else if (turun) {
        ctx.moveTo(tx, ty + TRI); ctx.lineTo(tx + TRI, ty - TRI * 0.65); ctx.lineTo(tx - TRI, ty - TRI * 0.65);
      }
      ctx.closePath(); ctx.fillStyle = color; ctx.fill();

      ctx.font = `bold ${changeFsz}px Arial, sans-serif`;
      ctx.fillStyle = color;
      ctx.fillText(item.perubahan, x + p(3) + TRI * 2.4, chY);
    } else {
      const note = (item.keterangan ?? item.periode ?? "").trim();
      if (note) {
        ctx.font = `${pt(6)}px Arial, sans-serif`; ctx.fillStyle = "#888";
        ctx.fillText(wrapLine(note, CARD_W - p(6)), x + p(3), chY);
      }
    }
  };

  // ── Render groups ──────────────────────────────────────
  let y = CARDS_START;
  for (let gi = 0; gi < grouped.length; gi++) {
    const [periode, cards] = grouped[gi];

    // Label periode (kuning dengan shadow)
    setShadow(p(2), "rgba(0,0,0,0.10)", p(1));
    rrPath(PAD, y, cw, LABEL_H, p(2.5));
    ctx.fillStyle = "#FEF3C7"; ctx.fill();
    clearShadow();
    rrPath(PAD, y, cw, LABEL_H, p(2.5));
    ctx.strokeStyle = "#F59E0B"; ctx.lineWidth = p(0.3); ctx.stroke();
    // Aksen kiri kuning-tua
    ctx.fillStyle = "#D97706";
    ctx.fillRect(PAD, y + p(1.5), p(3), LABEL_H - p(3));
    ctx.beginPath(); ctx.arc(PAD + p(1.5), y + p(1.5), p(1.5), 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(PAD + p(1.5), y + LABEL_H - p(1.5), p(1.5), 0, Math.PI*2); ctx.fill();

    ctx.font = `bold ${pt(8)}px Arial, sans-serif`;
    ctx.fillStyle = "#78350F";
    ctx.fillText(periode, PAD + p(6), y + LABEL_H * 0.69);
    y += LABEL_H + GAP_AL;

    let col = 0;
    for (const item of cards) {
      if (col === 2) { col = 0; y += CARD_H + GAP_Y; }
      drawCard(item, PAD + col * (CARD_W + GAP_X), y); col++;
    }
    y += CARD_H + (gi < grouped.length - 1 ? IG_GAP : 0);
  }

  // ── Ekspor PNG ────────────────────────────────────────
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
