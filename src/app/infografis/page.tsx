"use client";
import { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { infografisApi } from "@/lib/api";
import {
  ImageIcon, X, ChevronLeft, ChevronRight,
  Download, FileText, Search, Images,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3001";

interface Infografis {
  id: number;
  judul: string;
  deskripsi?: string;
  imageUrl: string;
}

async function downloadImage(url: string, judul: string) {
  try {
    const res  = await fetch(url);
    const blob = await res.blob();
    const ext  = blob.type.includes("png") ? "png" : blob.type.includes("webp") ? "webp" : "jpg";
    const a    = document.createElement("a");
    a.href     = URL.createObjectURL(blob);
    a.download = `${judul}.${ext}`;
    a.click();
    URL.revokeObjectURL(a.href);
  } catch {}
}

async function downloadPDF(url: string, judul: string) {
  try {
    const res    = await fetch(url);
    const blob   = await res.blob();
    const imgSrc = URL.createObjectURL(blob);
    const img    = new Image();
    img.src      = imgSrc;
    await new Promise((r) => { img.onload = r; });
    const { jsPDF } = await import("jspdf");
    const isPortrait = img.naturalHeight >= img.naturalWidth;
    const pdf = new jsPDF({ orientation: isPortrait ? "portrait" : "landscape", unit: "mm", format: "a4" });
    const pw  = pdf.internal.pageSize.getWidth();
    const ph  = pdf.internal.pageSize.getHeight();
    const margin = 12;
    const maxW = pw - margin * 2;
    const maxH = ph - margin * 2 - 14;
    const ratio = img.naturalWidth / img.naturalHeight;
    let w = maxW, h = maxW / ratio;
    if (h > maxH) { h = maxH; w = maxH * ratio; }
    const x = (pw - w) / 2;
    pdf.setFontSize(13); pdf.setTextColor(12, 35, 64);
    pdf.text(judul, margin, margin + 5);
    pdf.setFontSize(8); pdf.setTextColor(150);
    pdf.text("Sumber: BPS Kabupaten Toli-Toli", margin, margin + 10);
    pdf.addImage(imgSrc, "JPEG", x, margin + 14, w, h);
    pdf.save(`${judul}.pdf`);
    URL.revokeObjectURL(imgSrc);
  } catch {}
}

export default function InfografisPage() {
  const [items, setItems]     = useState<Infografis[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    infografisApi.getAll()
      .then((r) => setItems(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (i) => i.judul.toLowerCase().includes(q) || (i.deskripsi || "").toLowerCase().includes(q),
    );
  }, [items, search]);

  const open = lightbox !== null ? filtered[lightbox] : null;

  const handleKey = (e: KeyboardEvent) => {
    if (lightbox === null) return;
    if (e.key === "Escape") setLightbox(null);
    if (e.key === "ArrowLeft"  && lightbox > 0)                    setLightbox(lightbox - 1);
    if (e.key === "ArrowRight" && lightbox < filtered.length - 1)  setLightbox(lightbox + 1);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120]">
      <Navbar />

      {/* Page header */}
      <div className="bg-white dark:bg-[#0F1825] border-b border-slate-100 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
            <ImageIcon className="w-3.5 h-3.5" /> Infografis
          </span>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#0C2340] dark:text-white mb-1">
                Infografis BPS Toli-Toli
              </h1>
              <p className="text-slate-400 dark:text-slate-500 text-sm">
                Visualisasi data statistik Kabupaten Toli-Toli dalam bentuk infografis.
                {!loading && ` ${items.length} infografis tersedia.`}
              </p>
            </div>

            {/* Search */}
            <div className="relative sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari infografis..."
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-[#162133] text-sm text-[#1A1A2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-700 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid area */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Images className="w-14 h-14 text-slate-200 dark:text-slate-700 mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {search ? `Tidak ada infografis yang cocok dengan "${search}"` : "Belum ada infografis tersedia."}
            </p>
            {search && (
              <button onClick={() => setSearch("")} className="mt-3 text-sm text-purple-600 hover:underline font-semibold">
                Hapus pencarian
              </button>
            )}
          </div>
        ) : (
          <>
            {search && (
              <p className="text-xs text-slate-400 mb-4">
                Menampilkan {filtered.length} dari {items.length} infografis
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => setLightbox(i)}
                  className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 text-left"
                >
                  <img
                    src={`${API_BASE}${item.imageUrl}`}
                    alt={item.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='267' viewBox='0 0 200 267'%3E%3Crect width='200' height='267' fill='%23F1F5F9'/%3E%3Ctext x='100' y='138' font-size='13' text-anchor='middle' fill='%2394A3B8'%3EGambar%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent flex flex-col justify-end p-3 opacity-90 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-semibold leading-tight line-clamp-2">
                      {item.judul}
                    </p>
                    {item.deskripsi && (
                      <p className="text-white/60 text-[10px] mt-0.5 line-clamp-1">{item.deskripsi}</p>
                    )}
                  </div>
                  {/* Hover zoom hint */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1">
                      <span className="text-white text-[10px] font-semibold">Perbesar</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Lightbox ── */}
      {open !== null && lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          {/* Prev */}
          {lightbox > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1); }}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Image card */}
          <div
            className="relative max-w-3xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`${API_BASE}${open.imageUrl}`}
              alt={open.judul}
              className="w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
            />

            {/* Caption + actions */}
            <div className="mt-4 text-center w-full px-2">
              <p className="text-white font-bold text-sm">{open.judul}</p>
              {open.deskripsi && (
                <p className="text-white/50 text-xs mt-1">{open.deskripsi}</p>
              )}
              <p className="text-white/30 text-[10px] mt-1">
                {lightbox + 1} / {filtered.length}
              </p>
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
          {lightbox < filtered.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1); }}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Close */}
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-9 h-9 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
}
