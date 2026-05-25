"use client";
import { useEffect, useState } from "react";
import { infografisApi } from "@/lib/api";
import { ImageIcon, X, ChevronLeft, ChevronRight, Download, FileText } from "lucide-react";

async function downloadImage(url: string, judul: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  const ext = blob.type.includes("png") ? "png" : blob.type.includes("webp") ? "webp" : "jpg";
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${judul}.${ext}`;
  a.click();
  URL.revokeObjectURL(a.href);
}

async function downloadPDF(url: string, judul: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  const imgSrc = URL.createObjectURL(blob);
  const img = new Image();
  img.src = imgSrc;
  await new Promise((r) => { img.onload = r; });
  const { jsPDF } = await import("jspdf");
  const isPortrait = img.naturalHeight >= img.naturalWidth;
  const pdf = new jsPDF({
    orientation: isPortrait ? "portrait" : "landscape",
    unit: "mm",
    format: "a4",
  });
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();
  const margin = 12;
  const maxW = pw - margin * 2;
  const maxH = ph - margin * 2 - 14;
  const ratio = img.naturalWidth / img.naturalHeight;
  let w = maxW, h = maxW / ratio;
  if (h > maxH) { h = maxH; w = maxH * ratio; }
  const x = (pw - w) / 2;
  pdf.setFontSize(13);
  pdf.setTextColor(12, 35, 64);
  pdf.text(judul, margin, margin + 5);
  pdf.setFontSize(8);
  pdf.setTextColor(150);
  pdf.text("Sumber: BPS Kabupaten Toli-Toli", margin, margin + 10);
  pdf.addImage(imgSrc, "JPEG", x, margin + 14, w, h);
  pdf.save(`${judul}.pdf`);
  URL.revokeObjectURL(imgSrc);
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3001";

interface Infografis {
  id: number;
  judul: string;
  deskripsi?: string;
  imageUrl: string;
}

export default function InfografisSection() {
  const [items, setItems] = useState<Infografis[]>([]);
  const [lightbox, setLightbox] = useState<number | null>(null); // index

  useEffect(() => {
    infografisApi.getAll().then((r) => setItems(r.data)).catch(() => {});
  }, []);

  if (items.length === 0) return null;

  const open = lightbox !== null ? items[lightbox] : null;

  return (
    <>
      <section className="bg-white dark:bg-[#0F1825] py-16 border-t border-slate-100 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-10">
            <span className="section-tag mb-3">Infografis</span>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
              <h2 className="text-2xl md:text-3xl font-bold text-[#0C2340] dark:text-white">
                Infografis BPS Toli-Toli
              </h2>
              <p className="text-slate-400 dark:text-slate-500 text-sm">Klik gambar untuk memperbesar.</p>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setLightbox(i)}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-left"
              >
                {/* Gambar */}
                <img
                  src={`${API_BASE}${item.imageUrl}`}
                  alt={item.judul}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23F1F5F9'/%3E%3Ctext x='100' y='105' font-size='14' text-anchor='middle' fill='%2394A3B8'%3EGambar%3C/text%3E%3C/svg%3E";
                  }}
                />
                {/* Overlay teks */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-3">
                  <p className="text-white text-xs font-semibold leading-tight line-clamp-2">
                    {item.judul}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {open !== null && lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          {/* Prev */}
          {lightbox > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`${API_BASE}${open.imageUrl}`}
              alt={open.judul}
              className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
            <div className="mt-3 text-center">
              <p className="text-white font-semibold text-sm">{open.judul}</p>
              {open.deskripsi && (
                <p className="text-white/50 text-xs mt-1">{open.deskripsi}</p>
              )}
              <div className="flex justify-center gap-2 mt-3">
                <button
                  onClick={() => downloadImage(`${API_BASE}${open.imageUrl}`, open.judul)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Unduh Gambar
                </button>
                <button
                  onClick={() => downloadPDF(`${API_BASE}${open.imageUrl}`, open.judul)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" /> Unduh PDF
                </button>
              </div>
            </div>
          </div>

          {/* Next */}
          {lightbox < items.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Close */}
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
