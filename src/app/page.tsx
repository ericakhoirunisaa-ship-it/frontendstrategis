import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StatBoxCarousel from "@/components/beranda/StatBoxCarousel";
import KilasDataSection from "@/components/beranda/KilasDataSection";
import JadwalRilisSection from "@/components/beranda/JadwalRilisSection";
import TentangSection from "@/components/beranda/TentangSection";
import LayananSection from "@/components/beranda/LayananSection";
import InfografisSection from "@/components/beranda/InfografisSection";
import HeroSearch from "@/components/beranda/HeroSearch";
import Link from "next/link";
import { ArrowRight, Landmark, Shield, BarChart2, RefreshCw, Users } from "lucide-react";

const HERO_STATS = [
  { icon: Shield,    color: "#1D6FCA", label: "Data Resmi BPS",    desc: "Sumber data terpercaya dan terverifikasi" },
  { icon: BarChart2, color: "#059669", label: "20+ Indikator",      desc: "Indikator pembangunan strategis daerah" },
  { icon: RefreshCw, color: "#0891B2", label: "Diperbarui Berkala", desc: "Data diperbarui secara rutin dan berkala" },
  { icon: Users,     color: "#7C3AED", label: "350+ Pengunjung",    desc: "Dipercaya oleh banyak pengguna" },
];

export default function BerandaPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120]">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative bg-white dark:bg-[#0B1120] overflow-hidden">
        {/* Dekorasi blob kiri bawah */}
        <div
          className="absolute -left-32 bottom-0 w-[480px] h-[480px] rounded-full pointer-events-none opacity-20"
          style={{ background: "radial-gradient(circle, #93C5FD, transparent 65%)" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-stretch" style={{ minHeight: "480px" }}>

            {/* ── Teks kiri ── */}
            <div className="w-full lg:w-[50%] lg:flex-shrink-0 py-14 md:py-20 lg:pr-12 xl:pr-20 flex flex-col justify-center">
              {/* Chip instansi */}
              <div className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 w-fit">
                <Landmark className="w-3.5 h-3.5 text-[#1D6FCA] shrink-0" />
                <span className="text-[#1D6FCA] dark:text-blue-300 text-[11px] font-bold tracking-widest uppercase">
                  BPS Kabupaten Toli-Toli
                </span>
              </div>

              <h1 className="text-4xl md:text-[2.75rem] lg:text-5xl font-extrabold text-[#0C1A2E] dark:text-white leading-[1.15] mb-5">
                Sistem Informasi<br />
                Indikator Strategis<br />
                <span className="text-[#1D6FCA]">Kabupaten Toli-Toli</span>
              </h1>

              <p className="text-slate-500 dark:text-slate-400 text-[15px] leading-relaxed mb-8 max-w-md">
                Akses data statistik resmi, indikator pembangunan,
                dan informasi strategis Kabupaten Toli-Toli
                secara mudah, cepat, dan terpercaya.
              </p>

              <div className="flex flex-wrap gap-3 mb-6">
                <Link
                  href="/data-strategis"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1D6FCA] text-white text-sm font-bold hover:bg-[#1558A8] active:scale-[0.98] transition-all shadow-lg shadow-blue-200 dark:shadow-none"
                >
                  Jelajahi Data <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/layanan-konsultasi"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[#1D6FCA] text-[#1D6FCA] text-sm font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-[0.98] transition-all"
                >
                  <Landmark className="w-4 h-4" /> Layanan BPS
                </Link>
              </div>

              <HeroSearch />
            </div>

            {/* ── Foto kanan — full bleed ke tepi kanan ── */}
            <div
              className="hidden lg:block lg:flex-1 relative overflow-hidden"
              style={{ marginRight: "calc(-1 * max(2rem, calc((100vw - 80rem) / 2 + 2rem)))" }}
            >
              {/* Fade kiri menyatu dengan bg hero */}
              <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-white dark:from-[#0B1120] to-transparent z-10 pointer-events-none" />
              {/* Foto — taruh /public/hero-tolitoli.jpg untuk gambar nyata */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/hero-tolitoli.jpg')", backgroundColor: "#B8E4F9" }}
              />
              {/* Dekorasi garis gelombang */}
              <svg
                className="absolute right-6 inset-y-0 h-full w-28 opacity-[0.15] pointer-events-none"
                viewBox="0 0 80 400"
                preserveAspectRatio="none"
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <path
                    key={i}
                    d={`M ${68 - i * 13} 0 Q ${28 - i * 8} 200 ${68 - i * 13} 400`}
                    fill="none"
                    stroke="#1D6FCA"
                    strokeWidth="1.5"
                  />
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className="border-t border-slate-100 dark:border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 lg:gap-8">
              {HERO_STATS.map(({ icon: Icon, color, label, desc }) => (
                <div key={label} className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: color + "18" }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#0C1A2E] dark:text-white leading-tight">{label}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-snug mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATISTIK UTAMA ───────────────────────────────────── */}
      <section className="bg-white dark:bg-[#0F1825] border-b border-slate-100 dark:border-slate-700/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-7">
            <div>
              <span className="section-tag mb-2">Statistik Utama</span>
              <h2 className="text-xl md:text-2xl font-bold text-[#0C2340] dark:text-white">
                Ringkasan Indikator Kab. Toli-Toli
              </h2>
            </div>
            <Link
              href="/data-strategis"
              className="hidden sm:flex items-center gap-1 text-[#1D6FCA] text-sm font-semibold hover:underline"
            >
              Lihat semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <StatBoxCarousel />
        </div>
      </section>

      {/* ── KILAS DATA ───────────────────────────────────────── */}
      <KilasDataSection />

      {/* ── INFOGRAFIS ───────────────────────────────────────── */}
      <InfografisSection />

      {/* ── JADWAL RILIS ─────────────────────────────────────── */}
      <JadwalRilisSection />

      {/* ── TENTANG ──────────────────────────────────────────── */}
      <TentangSection />

      {/* ── LAYANAN ──────────────────────────────────────────── */}
      <LayananSection />

      <Footer />
    </div>
  );
}
